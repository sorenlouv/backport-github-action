import { Context } from '@actions/github/lib/context';
export declare function run({ context, inputs, }: {
    context: Context;
    inputs: {
        accessToken: string;
        autoBackportLabelPrefix: string;
        repoForkOwner: string;
    };
}): Promise<import("backport").BackportResponse>;
