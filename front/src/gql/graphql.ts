/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** `Date` type as integer. Type represents date and time as number of milliseconds from start of UNIX epoch. */
  Timestamp: { input: any; output: any; }
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: any; output: any; }
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  access_token: Scalars['String']['output'];
};

export type CreateUserInput = {
  email: Scalars['String']['input'];
  name: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
};

export type DeleteFileInput = {
  fileName: Scalars['String']['input'];
  id: Scalars['Float']['input'];
};

export type Document = {
  __typename?: 'Document';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  status: Scalars['String']['output'];
  user: Array<User>;
  userId: Scalars['Float']['output'];
};

export type GetLogsInput = {
  types: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Log = {
  __typename?: 'Log';
  id: Scalars['String']['output'];
  message: Scalars['String']['output'];
  timestamp: Scalars['Timestamp']['output'];
  type: Scalars['String']['output'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createDocument: Scalars['Boolean']['output'];
  createUser: UserDto;
  deleteFileInFolder: Scalars['Boolean']['output'];
  login: AuthResponse;
  logs: Array<Log>;
  updateDocument: Scalars['Boolean']['output'];
};


export type MutationCreateDocumentArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteFileInFolderArgs = {
  input: DeleteFileInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationLogsArgs = {
  input: GetLogsInput;
};


export type MutationUpdateDocumentArgs = {
  input: UpdateDocumentInput;
};

export type Query = {
  __typename?: 'Query';
  getDocumentContent: Scalars['String']['output'];
  getFileUrl: Scalars['String']['output'];
  getUserById: Maybe<UserDto>;
  getUsers: Array<UserDto>;
  hello: Scalars['String']['output'];
  listFilesInFolder: Array<Document>;
};


export type QueryGetDocumentContentArgs = {
  id: Scalars['Float']['input'];
};


export type QueryGetFileUrlArgs = {
  id: Scalars['Float']['input'];
};

/** User role (admin or user) */
export type Role = 'ADMIN' | 'USER';

export type UpdateDocumentInput = {
  file: Scalars['Upload']['input'];
  id: Scalars['Int']['input'];
};

export type User = {
  __typename?: 'User';
  documents: Maybe<Array<Document>>;
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Maybe<Scalars['String']['output']>;
  role: Role;
};

export type UserDto = {
  __typename?: 'UserDTO';
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Maybe<Scalars['String']['output']>;
  role: Role;
};
