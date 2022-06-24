import { Context } from '@actions/github/lib/context';
import { BackportResponse } from 'backport';
declare type Inputs = {
    accessToken: string;
    autoBackportLabelPrefix: string;
    repoForkOwner: string;
};
export declare function run({ context, inputs, }: {
    context: Context;
    inputs: Inputs;
}): Promise<ActionResult>;
declare type ActionResult = BackportResponse | {
    status: 'skipped';
    message: string;
};
export declare function getFailureMessage(res: ActionResult): string | undefined;
export {};
