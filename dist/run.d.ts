import { Context } from '@actions/github/lib/context';
import { BackportResponse } from 'backport';
export declare function run({ context, inputs, }: {
    context: Context;
    inputs: {
        accessToken: string;
        autoBackportLabelPrefix: string;
        repoForkOwner: string;
        addOriginalReviewers: boolean;
    };
}): Promise<BackportResponse>;
export declare function getFailureMessage(res: BackportResponse): string | undefined;
