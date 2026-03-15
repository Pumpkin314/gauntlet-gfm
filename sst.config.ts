/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: 'gauntlet-gfm',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
      providers: { aws: { region: 'us-east-1' } },
    };
  },
  async run() {
    new sst.aws.Nextjs('GfmSite', {
      environment: {
        DATABASE_URL: process.env.DATABASE_URL!,
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL!,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN!,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
        MUX_TOKEN_ID: process.env.MUX_TOKEN_ID!,
        MUX_TOKEN_SECRET: process.env.MUX_TOKEN_SECRET!,
        NEXT_PUBLIC_MUX_ENV_KEY: process.env.NEXT_PUBLIC_MUX_ENV_KEY!,
      },
    });
  },
});
