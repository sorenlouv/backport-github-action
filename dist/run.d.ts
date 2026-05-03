import type { context } from '@actions/github';
import { type BackportResponse } from 'backport';
type Context = typeof context;
type Inputs = {
    githubToken: string;
    autoBackportLabelPrefix: string;
    repoForkOwner: string;
    copySourcePRReviewers: boolean;
};
export declare function run({ context, inputs, }: {
    context: Context;
    inputs: Inputs;
}): Promise<BackportResponse>;
export declare function getFailureMessage(res: BackportResponse, ignoredErrorCodes?: string[]): string | undefined;
export {};
