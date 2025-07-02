import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { PrismaService } from '../prisma.service';
import { AzureBlobService } from '../worker/azure-blob.storage';
import { getQueueToken } from '@nestjs/bullmq';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { LogProducerService } from 'src/log/log-producer.service';

const mockPrismaService = {
  document: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
  },
};

const mockAzureBlobService = {
  getFileSasUrl: jest.fn(),
  downloadFileContent: jest.fn(),
};

const mockDocumentQueue = {
  add: jest.fn(),
};

describe('DocumentService', () => {
  let service: DocumentService;
  let prisma: typeof mockPrismaService;
  let azureBlob: typeof mockAzureBlobService;
  let queue: typeof mockDocumentQueue;
  let logProducerService: { addLog: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AzureBlobService, useValue: mockAzureBlobService },
        {
          provide: getQueueToken('document-queue'),
          useValue: mockDocumentQueue,
        },
        { provide: LogProducerService, useValue: { addLog: jest.fn() } },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    prisma = module.get(PrismaService);
    azureBlob = module.get(AzureBlobService);
    queue = module.get(getQueueToken('document-queue'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should add a document to the queue', async () => {
      prisma.document.findFirst.mockResolvedValue(null);
      const fileBuffer = Buffer.from('test');
      const originalFilename = 'test.txt';
      const userId = 1;
      const userEmail = 'test@example.com';

      const result = await service.create(
        fileBuffer,
        originalFilename,
        userId,
        userEmail,
      );

      expect(prisma.document.findFirst).toHaveBeenCalledWith({
        where: { name: originalFilename, userId },
      });
      expect(queue.add).toHaveBeenCalledWith('upload-document', {
        fileBuffer,
        originalFilename,
        userId,
        userEmail,
      });
      expect(result).toBe(true);
    });

    it('should throw an error if document already exists', async () => {
      prisma.document.findFirst.mockResolvedValue({
        id: 1,
        name: 'test.txt',
        userId: 1,
        status: 'processed',
      });
      const fileBuffer = Buffer.from('test');
      const originalFilename = 'test.txt';
      const userId = 1;
      const userEmail = 'test@example.com';

      await expect(
        service.create(fileBuffer, originalFilename, userId, userEmail),
      ).rejects.toThrow('A document with the name "test.txt" already exists.');
    });
  });

  describe('updateDocument', () => {
    it('should add an update job to the queue', async () => {
      prisma.document.findUnique.mockResolvedValue({
        id: 1,
        name: 'test.txt',
        userId: 1,
        status: 'processed',
      });
      const fileBuffer = Buffer.from('test-updated');
      const originalFilename = 'test-updated.txt';
      const userEmail = 'test@example.com';

      const result = await service.updateDocument(
        1,
        fileBuffer,
        originalFilename,
        1,
        userEmail,
      );

      expect(queue.add).toHaveBeenCalledWith('update-document', {
        id: 1,
        fileBuffer,
        originalFilename,
        userEmail,
      });
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if document not found or user is not owner', async () => {
      prisma.document.findUnique.mockResolvedValue(null);
      const fileBuffer = Buffer.from('test');
      const originalFilename = 'test.txt';
      const userEmail = 'test@example.com';

      await expect(
        service.updateDocument(1, fileBuffer, originalFilename, 1, userEmail),
      ).rejects.toThrow(UnauthorizedException);

      prisma.document.findUnique.mockResolvedValue({
        id: 1,
        name: 'test.txt',
        userId: 2,
        status: 'processed',
      });
      await expect(
        service.updateDocument(1, fileBuffer, originalFilename, 1, userEmail),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('listFiles', () => {
    it('should return a list of documents for a user', async () => {
      const documents = [
        {
          id: 1,
          name: 'test.txt',
          userId: 1,
          status: 'processed',
          user: { email: 'test@example.com' },
        },
      ];
      prisma.document.findMany.mockResolvedValue(documents);

      const result = await service.listFiles(1);

      expect(prisma.document.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
      expect(result).toEqual(documents);
    });
  });

  describe('deleteFile', () => {
    it('should delete a file', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'password',
      });
      prisma.document.findFirst.mockResolvedValue({
        id: 1,
        name: 'test.txt',
        userId: 1,
        status: 'processed',
      });

      await service.deleteFile(1, 1);

      expect(prisma.document.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw UnauthorizedException if user is not the owner', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'password',
      });
      prisma.document.findFirst.mockResolvedValue({
        id: 1,
        name: 'test.txt',
        userId: 2,
        status: 'processed',
      });

      await expect(service.deleteFile(1, 1)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getSecuredFileUrl', () => {
    it('should return a SAS URL for a file', async () => {
      const doc = { id: 1, name: 'test.txt', userId: 1, status: 'processed' };
      const user = { id: 1, email: 'test@example.com', password: 'password' };
      const sasUrl = 'http://sas.url';
      prisma.document.findUnique.mockResolvedValue(doc);
      prisma.user.findFirst.mockResolvedValue(user);
      azureBlob.getFileSasUrl.mockResolvedValue(sasUrl);

      const result = await service.getSecuredFileUrl(1, 1);

      expect(azureBlob.getFileSasUrl).toHaveBeenCalledWith(
        `${user.email}/${doc.name}`,
      );
      expect(result).toBe(sasUrl);
    });

    it('should throw NotFoundException if document not found', async () => {
      prisma.document.findUnique.mockResolvedValue(null);
      await expect(service.getSecuredFileUrl(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if user is not the owner', async () => {
      const doc = { id: 1, name: 'test.txt', userId: 2, status: 'processed' };
      prisma.document.findUnique.mockResolvedValue(doc);
      await expect(service.getSecuredFileUrl(1, 1)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getDocumentContent', () => {
    it('should return file content for a .txt file', async () => {
      const doc = { id: 1, name: 'test.txt', userId: 1, status: 'processed' };
      const user = { id: 1, email: 'test@example.com', password: 'password' };
      const content = 'file content';
      prisma.document.findUnique.mockResolvedValue(doc);
      prisma.user.findFirst.mockResolvedValue(user);
      azureBlob.downloadFileContent.mockResolvedValue(content);

      const result = await service.getDocumentContent(1, 1);

      expect(azureBlob.downloadFileContent).toHaveBeenCalledWith(
        `${user.email}/${doc.name}`,
      );
      expect(result).toBe(content);
    });

    it('should throw an error for non .txt files', async () => {
      const doc = { id: 1, name: 'test.pdf', userId: 1, status: 'processed' };
      prisma.document.findUnique.mockResolvedValue(doc);

      await expect(service.getDocumentContent(1, 1)).rejects.toThrow(
        'This endpoint only supports .txt files.',
      );
    });

    it('should throw NotFoundException if document not found', async () => {
      prisma.document.findUnique.mockResolvedValue(null);
      await expect(service.getDocumentContent(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if user is not the owner', async () => {
      const doc = { id: 1, name: 'test.txt', userId: 2, status: 'processed' };
      prisma.document.findUnique.mockResolvedValue(doc);
      await expect(service.getDocumentContent(1, 1)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
