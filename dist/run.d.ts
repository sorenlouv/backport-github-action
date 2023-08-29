import { Context } from '@actions/github/lib/context';
import { BackportResponse } from 'backport';
type Inputs = {
    accessToken: string;
    autoBackportLabelPrefix: string;
    repoForkOwner: string;
    addOriginalReviewers: boolean;
};
export declare function run({ context, inputs, }: {
    context: Context;
    inputs: Inputs;
}): Promise<BackportResponse>;
export declare function getFailureMessage(res: BackportResponse): string | undefined;
export {};
