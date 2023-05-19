export type TProjectInfo = {
  isInternal?: boolean;
  name: string;
  copyright: 'Copyright ©' | 'Community Project ©';
  owner?: string;
  license?: string;
  web?: string;
  twitter?: string;
  telegram?: string;
  youtube?: string;
  discord?: string;
  reddit?: string;
  whitePaper?: string;
  github?: string;
  logoUrl?: string;
  tokenSymbol?: string;
  contracts?: string[] | null;
  envPrefix?: string[] | null;
  termsText: string;
}
