import { EventPayloads } from '@octokit/webhooks';

export const getClosedPRPayload = ({
  repoOwner,
  repoName,
  username,
  defaultBranch = 'master',
}: {
  repoOwner: string;
  repoName: string;
  username: string;
  defaultBranch?: string;
}): EventPayloads.WebhookPayloadPullRequest => {
  return {
    action: 'closed',
    number: 34,
    organization: {
      avatar_url: 'https://avatars0.githubusercontent.com/u/69669900?v=4',
      description: null,
      events_url: 'https://api.github.com/orgs/' + repoOwner + '/events',
      hooks_url: 'https://api.github.com/orgs/' + repoOwner + '/hooks',
      id: 69669900,
      issues_url: 'https://api.github.com/orgs/' + repoOwner + '/issues',
      login: repoOwner,
      members_url:
        'https://api.github.com/orgs/' + repoOwner + '/members{/member}',
      node_id: 'MDEyOk9yZ2FuaXphdGlvbjY5NjY5OTAw',
      public_members_url:
        'https://api.github.com/orgs/' + repoOwner + '/public_members{/member}',
      repos_url: 'https://api.github.com/orgs/' + repoOwner + '/repos',
      url: 'https://api.github.com/orgs/' + repoOwner,
    },
    pull_request: {
      _links: {
        comments: {
          href:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/issues/34/comments',
        },
        commits: {
          href:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/pulls/34/commits',
        },
        html: {
          href: 'https://github.com/' + repoOwner + '/' + repoName + '/pull/34',
        },
        issue: {
          href:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/issues/34',
        },
        review_comment: {
          href:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/pulls/comments{/number}',
        },
        review_comments: {
          href:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/pulls/34/comments',
        },
        self: {
          href:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/pulls/34',
        },
        statuses: {
          href:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/statuses/1af652f1ad8a1c3bd71522ec3d770171cc79eb61',
        },
      },
      active_lock_reason: null,
      additions: 1,
      assignee: null,
      assignees: [],
      author_association: 'CONTRIBUTOR',
      base: {
        label: repoOwner + ':master',
        ref: 'master',
        repo: {
          allow_merge_commit: false,
          allow_rebase_merge: false,
          allow_squash_merge: true,
          archive_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/{archive_format}{/ref}',
          archived: false,
          assignees_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/assignees{/user}',
          blobs_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/git/blobs{/sha}',
          branches_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/branches{/branch}',
          clone_url:
            'https://github.com/' + repoOwner + '/' + repoName + '.git',
          collaborators_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/collaborators{/collaborator}',
          comments_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/comments{/number}',
          commits_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/commits{/sha}',
          compare_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/compare/{base}...{head}',
          contents_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/contents/{+path}',
          contributors_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/contributors',
          created_at: '2020-08-14T07:49:15Z',
          default_branch: defaultBranch,
          delete_branch_on_merge: false,
          deployments_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/deployments',
          //@ts-expect-error
          description: 'Demo repo for testing out backporting',
          disabled: false,
          downloads_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/downloads',
          events_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/events',
          fork: false,
          forks: 1,
          forks_count: 1,
          forks_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/forks',
          full_name: repoOwner + '/' + repoName,
          git_commits_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/git/commits{/sha}',
          git_refs_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/git/refs{/sha}',
          git_tags_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/git/tags{/sha}',
          git_url: 'git://github.com/' + repoOwner + '/' + repoName + '.git',
          has_downloads: true,
          has_issues: true,
          has_pages: false,
          has_projects: true,
          has_wiki: true,
          homepage: null,
          hooks_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/hooks',
          html_url: 'https://github.com/' + repoOwner + '/' + repoName,
          id: 287475646,
          issue_comment_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/issues/comments{/number}',
          issue_events_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/issues/events{/number}',
          issues_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/issues{/number}',
          keys_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/keys{/key_id}',
          labels_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/labels{/name}',
          language: null,
          languages_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/languages',
          license: null,
          merges_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/merges',
          milestones_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/milestones{/number}',
          mirror_url: null,
          name: repoName,
          node_id: 'MDEwOlJlcG9zaXRvcnkyODc0NzU2NDY=',
          notifications_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/notifications{?since,all,participating}',
          open_issues: 1,
          open_issues_count: 1,
          owner: {
            avatar_url: 'https://avatars0.githubusercontent.com/u/69669900?v=4',
            events_url:
              'https://api.github.com/users/' + repoOwner + '/events{/privacy}',
            followers_url:
              'https://api.github.com/users/' + repoOwner + '/followers',
            following_url:
              'https://api.github.com/users/' +
              repoOwner +
              '/following{/other_user}',
            gists_url:
              'https://api.github.com/users/' + repoOwner + '/gists{/gist_id}',
            gravatar_id: '',
            html_url: 'https://github.com/' + repoOwner,
            id: 69669900,
            login: repoOwner,
            node_id: 'MDEyOk9yZ2FuaXphdGlvbjY5NjY5OTAw',
            organizations_url:
              'https://api.github.com/users/' + repoOwner + '/orgs',
            received_events_url:
              'https://api.github.com/users/' + repoOwner + '/received_events',
            repos_url: 'https://api.github.com/users/' + repoOwner + '/repos',
            site_admin: false,
            starred_url:
              'https://api.github.com/users/' +
              repoOwner +
              '/starred{/owner}{/repo}',
            subscriptions_url:
              'https://api.github.com/users/' + repoOwner + '/subscriptions',
            type: 'Organization',
            url: 'https://api.github.com/users/' + repoOwner,
          },
          private: false,
          pulls_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/pulls{/number}',
          pushed_at: '2020-09-12T18:11:55Z',
          releases_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/releases{/id}',
          size: 664,
          ssh_url: 'git@github.com:' + repoOwner + '/' + repoName + '.git',
          stargazers_count: 0,
          stargazers_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/stargazers',
          statuses_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/statuses/{sha}',
          subscribers_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/subscribers',
          subscription_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/subscription',
          svn_url: 'https://github.com/' + repoOwner + '/' + repoName,
          tags_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/tags',
          teams_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/teams',
          trees_url:
            'https://api.github.com/repos/' +
            repoOwner +
            '/' +
            repoName +
            '/git/trees{/sha}',
          updated_at: '2020-09-11T22:04:45Z',
          url: 'https://api.github.com/repos/' + repoOwner + '/' + repoName,
          watchers: 0,
          watchers_count: 0,
        },
        sha: '241cac35ee8e6c1cae400e7cc9145fe505adac9d',
        user: {
          avatar_url: 'https://avatars0.githubusercontent.com/u/69669900?v=4',
          events_url:
            'https://api.github.com/users/' + repoOwner + '/events{/privacy}',
          followers_url:
            'https://api.github.com/users/' + repoOwner + '/followers',
          following_url:
            'https://api.github.com/users/' +
            repoOwner +
            '/following{/other_user}',
          gists_url:
            'https://api.github.com/users/' + repoOwner + '/gists{/gist_id}',
          gravatar_id: '',
          html_url: 'https://github.com/' + repoOwner,
          id: 69669900,
          login: repoOwner,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjY5NjY5OTAw',
          organizations_url:
            'https://api.github.com/users/' + repoOwner + '/orgs',
          received_events_url:
            'https://api.github.com/users/' + repoOwner + '/received_events',
          repos_url: 'https://api.github.com/users/' + repoOwner + '/repos',
          site_admin: false,
          starred_url:
            'https://api.github.com/users/' +
            repoOwner +
            '/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/' + repoOwner + '/subscriptions',
          type: 'Organization',
          url: 'https://api.github.com/users/' + repoOwner,
        },
      },
      body: '',
      changed_files: 1,
      closed_at: '2020-09-12T18:11:56Z',
      comments: 0,
      comments_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/issues/34/comments',
      commits: 1,
      commits_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/pulls/34/commits',
      created_at: '2020-09-12T18:11:40Z',
      deletions: 1,
      diff_url:
        'https://github.com/' + repoOwner + '/' + repoName + '/pull/34.diff',
      draft: false,
      head: {
        label: username + ':add-fire',
        ref: 'add-fire',
        repo: {
          allow_merge_commit: true,
          allow_rebase_merge: true,
          allow_squash_merge: true,
          archive_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/{archive_format}{/ref}',
          archived: false,
          assignees_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/assignees{/user}',
          blobs_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/git/blobs{/sha}',
          branches_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/branches{/branch}',
          clone_url: 'https://github.com/' + username + '/' + repoName + '.git',
          collaborators_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/collaborators{/collaborator}',
          comments_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/comments{/number}',
          commits_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/commits{/sha}',
          compare_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/compare/{base}...{head}',
          contents_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/contents/{+path}',
          contributors_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/contributors',
          created_at: '2020-09-12T18:10:26Z',
          default_branch: defaultBranch,
          delete_branch_on_merge: false,
          deployments_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/deployments',
          //@ts-expect-error
          description: 'Demo repo for testing out backporting',
          disabled: false,
          downloads_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/downloads',
          events_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/events',
          fork: true,
          forks: 0,
          forks_count: 0,
          forks_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/forks',
          full_name: username + '/' + repoName,
          git_commits_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/git/commits{/sha}',
          git_refs_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/git/refs{/sha}',
          git_tags_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/git/tags{/sha}',
          git_url: 'git://github.com/' + username + '/' + repoName + '.git',
          has_downloads: true,
          has_issues: false,
          has_pages: false,
          has_projects: true,
          has_wiki: true,
          homepage: null,
          hooks_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/hooks',
          html_url: 'https://github.com/' + username + '/' + repoName,
          id: 294999879,
          issue_comment_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/issues/comments{/number}',
          issue_events_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/issues/events{/number}',
          issues_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/issues{/number}',
          keys_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/keys{/key_id}',
          labels_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/labels{/name}',
          language: null,
          languages_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/languages',
          license: null,
          merges_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/merges',
          milestones_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/milestones{/number}',
          mirror_url: null,
          name: repoName,
          node_id: 'MDEwOlJlcG9zaXRvcnkyOTQ5OTk4Nzk=',
          notifications_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/notifications{?since,all,participating}',
          open_issues: 0,
          open_issues_count: 0,
          owner: {
            avatar_url: 'https://avatars3.githubusercontent.com/u/209966?v=4',
            events_url:
              'https://api.github.com/users/' + username + '/events{/privacy}',
            followers_url:
              'https://api.github.com/users/' + username + '/followers',
            following_url:
              'https://api.github.com/users/' +
              username +
              '/following{/other_user}',
            gists_url:
              'https://api.github.com/users/' + username + '/gists{/gist_id}',
            gravatar_id: '',
            html_url: 'https://github.com/' + username,
            id: 209966,
            login: username,
            node_id: 'MDQ6VXNlcjIwOTk2Ng==',
            organizations_url:
              'https://api.github.com/users/' + username + '/orgs',
            received_events_url:
              'https://api.github.com/users/' + username + '/received_events',
            repos_url: 'https://api.github.com/users/' + username + '/repos',
            site_admin: false,
            starred_url:
              'https://api.github.com/users/' +
              username +
              '/starred{/owner}{/repo}',
            subscriptions_url:
              'https://api.github.com/users/' + username + '/subscriptions',
            type: 'User',
            url: 'https://api.github.com/users/' + username,
          },
          private: false,
          pulls_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/pulls{/number}',
          pushed_at: '2020-09-12T18:11:01Z',
          releases_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/releases{/id}',
          size: 664,
          ssh_url: 'git@github.com:' + username + '/' + repoName + '.git',
          stargazers_count: 0,
          stargazers_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/stargazers',
          statuses_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/statuses/{sha}',
          subscribers_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/subscribers',
          subscription_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/subscription',
          svn_url: 'https://github.com/' + username + '/' + repoName,
          tags_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/tags',
          teams_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/teams',
          trees_url:
            'https://api.github.com/repos/' +
            username +
            '/' +
            repoName +
            '/git/trees{/sha}',
          updated_at: '2020-09-12T18:10:28Z',
          url: 'https://api.github.com/repos/' + username + '/' + repoName,
          watchers: 0,
          watchers_count: 0,
        },
        sha: '1af652f1ad8a1c3bd71522ec3d770171cc79eb61',
        user: {
          avatar_url: 'https://avatars3.githubusercontent.com/u/209966?v=4',
          events_url:
            'https://api.github.com/users/' + username + '/events{/privacy}',
          followers_url:
            'https://api.github.com/users/' + username + '/followers',
          following_url:
            'https://api.github.com/users/' +
            username +
            '/following{/other_user}',
          gists_url:
            'https://api.github.com/users/' + username + '/gists{/gist_id}',
          gravatar_id: '',
          html_url: 'https://github.com/' + username,
          id: 209966,
          login: username,
          node_id: 'MDQ6VXNlcjIwOTk2Ng==',
          organizations_url:
            'https://api.github.com/users/' + username + '/orgs',
          received_events_url:
            'https://api.github.com/users/' + username + '/received_events',
          repos_url: 'https://api.github.com/users/' + username + '/repos',
          site_admin: false,
          starred_url:
            'https://api.github.com/users/' +
            username +
            '/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/' + username + '/subscriptions',
          type: 'User',
          url: 'https://api.github.com/users/' + username,
        },
      },
      html_url: 'https://github.com/' + repoOwner + '/' + repoName + '/pull/34',
      id: 485979020,
      issue_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/issues/34',
      labels: [
        {
          color: 'ecf977',
          default: false,
          //@ts-expect-error
          description: '',
          id: 2344596373,
          name: 'backport-to-production',
          node_id: 'MDU6TGFiZWwyMzQ0NTk2Mzcz',
          url:
            'https://api.github.com/repos/backport-org/backport-demo/labels/backport-to-production',
        },
      ],
      locked: false,
      maintainer_can_modify: false,
      merge_commit_sha: '10f8e83dd087771756b7ca6e5be1f8973bf2415f',
      mergeable: null,
      mergeable_state: 'unknown',
      merged: true,
      //@ts-expect-error
      merged_at: '2020-09-12T18:11:56Z',
      //@ts-expect-error
      merged_by: {
        avatar_url: 'https://avatars3.githubusercontent.com/u/209966?v=4',
        events_url:
          'https://api.github.com/users/' + username + '/events{/privacy}',
        followers_url:
          'https://api.github.com/users/' + username + '/followers',
        following_url:
          'https://api.github.com/users/' +
          username +
          '/following{/other_user}',
        gists_url:
          'https://api.github.com/users/' + username + '/gists{/gist_id}',
        gravatar_id: '',
        html_url: 'https://github.com/' + username,
        id: 209966,
        login: username,
        node_id: 'MDQ6VXNlcjIwOTk2Ng==',
        organizations_url: 'https://api.github.com/users/' + username + '/orgs',
        received_events_url:
          'https://api.github.com/users/' + username + '/received_events',
        repos_url: 'https://api.github.com/users/' + username + '/repos',
        site_admin: false,
        starred_url:
          'https://api.github.com/users/' +
          username +
          '/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/' + username + '/subscriptions',
        type: 'User',
        url: 'https://api.github.com/users/' + username,
      },
      milestone: null,
      node_id: 'MDExOlB1bGxSZXF1ZXN0NDg1OTc5MDIw',
      number: 34,
      patch_url:
        'https://github.com/' + repoOwner + '/' + repoName + '/pull/34.patch',
      rebaseable: null,
      requested_reviewers: [],
      requested_teams: [],
      review_comment_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/pulls/comments{/number}',
      review_comments: 0,
      review_comments_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/pulls/34/comments',
      state: 'closed',
      statuses_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/statuses/1af652f1ad8a1c3bd71522ec3d770171cc79eb61',
      title: 'Add fire emoji',
      updated_at: '2020-09-12T18:11:56Z',
      url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/pulls/34',
      user: {
        avatar_url: 'https://avatars3.githubusercontent.com/u/209966?v=4',
        events_url:
          'https://api.github.com/users/' + username + '/events{/privacy}',
        followers_url:
          'https://api.github.com/users/' + username + '/followers',
        following_url:
          'https://api.github.com/users/' +
          username +
          '/following{/other_user}',
        gists_url:
          'https://api.github.com/users/' + username + '/gists{/gist_id}',
        gravatar_id: '',
        html_url: 'https://github.com/' + username,
        id: 209966,
        login: username,
        node_id: 'MDQ6VXNlcjIwOTk2Ng==',
        organizations_url: 'https://api.github.com/users/' + username + '/orgs',
        received_events_url:
          'https://api.github.com/users/' + username + '/received_events',
        repos_url: 'https://api.github.com/users/' + username + '/repos',
        site_admin: false,
        starred_url:
          'https://api.github.com/users/' +
          username +
          '/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/' + username + '/subscriptions',
        type: 'User',
        url: 'https://api.github.com/users/' + username,
      },
    },
    repository: {
      archive_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/{archive_format}{/ref}',
      archived: false,
      assignees_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/assignees{/user}',
      blobs_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/git/blobs{/sha}',
      branches_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/branches{/branch}',
      clone_url: 'https://github.com/' + repoOwner + '/' + repoName + '.git',
      collaborators_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/collaborators{/collaborator}',
      comments_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/comments{/number}',
      commits_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/commits{/sha}',
      compare_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/compare/{base}...{head}',
      contents_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/contents/{+path}',
      contributors_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/contributors',
      created_at: '2020-08-14T07:49:15Z',
      default_branch: defaultBranch,
      deployments_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/deployments',
      description: 'Demo repo for testing out backporting',
      disabled: false,
      downloads_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/downloads',
      events_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/events',
      fork: false,
      forks: 1,
      forks_count: 1,
      forks_url:
        'https://api.github.com/repos/' + repoOwner + '/' + repoName + '/forks',
      full_name: repoOwner + '/' + repoName,
      git_commits_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/git/commits{/sha}',
      git_refs_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/git/refs{/sha}',
      git_tags_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/git/tags{/sha}',
      git_url: 'git://github.com/' + repoOwner + '/' + repoName + '.git',
      has_downloads: true,
      has_issues: true,
      has_pages: false,
      has_projects: true,
      has_wiki: true,
      homepage: null,
      hooks_url:
        'https://api.github.com/repos/' + repoOwner + '/' + repoName + '/hooks',
      html_url: 'https://github.com/' + repoOwner + '/' + repoName,
      id: 287475646,
      issue_comment_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/issues/comments{/number}',
      issue_events_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/issues/events{/number}',
      issues_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/issues{/number}',
      keys_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/keys{/key_id}',
      labels_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/labels{/name}',
      language: null,
      languages_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/languages',
      license: null,
      merges_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/merges',
      milestones_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/milestones{/number}',
      mirror_url: null,
      name: repoName,
      node_id: 'MDEwOlJlcG9zaXRvcnkyODc0NzU2NDY=',
      notifications_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/notifications{?since,all,participating}',
      open_issues: 1,
      open_issues_count: 1,
      owner: {
        avatar_url: 'https://avatars0.githubusercontent.com/u/69669900?v=4',
        events_url:
          'https://api.github.com/users/' + repoOwner + '/events{/privacy}',
        followers_url:
          'https://api.github.com/users/' + repoOwner + '/followers',
        following_url:
          'https://api.github.com/users/' +
          repoOwner +
          '/following{/other_user}',
        gists_url:
          'https://api.github.com/users/' + repoOwner + '/gists{/gist_id}',
        gravatar_id: '',
        html_url: 'https://github.com/' + repoOwner,
        id: 69669900,
        login: repoOwner,
        node_id: 'MDEyOk9yZ2FuaXphdGlvbjY5NjY5OTAw',
        organizations_url:
          'https://api.github.com/users/' + repoOwner + '/orgs',
        received_events_url:
          'https://api.github.com/users/' + repoOwner + '/received_events',
        repos_url: 'https://api.github.com/users/' + repoOwner + '/repos',
        site_admin: false,
        starred_url:
          'https://api.github.com/users/' +
          repoOwner +
          '/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/' + repoOwner + '/subscriptions',
        type: 'Organization',
        url: 'https://api.github.com/users/' + repoOwner,
      },
      private: false,
      pulls_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/pulls{/number}',
      pushed_at: '2020-09-12T18:11:55Z',
      releases_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/releases{/id}',
      size: 664,
      ssh_url: 'git@github.com:' + repoOwner + '/' + repoName + '.git',
      stargazers_count: 0,
      stargazers_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/stargazers',
      statuses_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/statuses/{sha}',
      subscribers_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/subscribers',
      subscription_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/subscription',
      svn_url: 'https://github.com/' + repoOwner + '/' + repoName,
      tags_url:
        'https://api.github.com/repos/' + repoOwner + '/' + repoName + '/tags',
      teams_url:
        'https://api.github.com/repos/' + repoOwner + '/' + repoName + '/teams',
      trees_url:
        'https://api.github.com/repos/' +
        repoOwner +
        '/' +
        repoName +
        '/git/trees{/sha}',
      updated_at: '2020-09-11T22:04:45Z',
      url: 'https://api.github.com/repos/' + repoOwner + '/' + repoName,
      watchers: 0,
      watchers_count: 0,
    },
    sender: {
      avatar_url: 'https://avatars3.githubusercontent.com/u/209966?v=4',
      events_url:
        'https://api.github.com/users/' + username + '/events{/privacy}',
      followers_url: 'https://api.github.com/users/' + username + '/followers',
      following_url:
        'https://api.github.com/users/' + username + '/following{/other_user}',
      gists_url:
        'https://api.github.com/users/' + username + '/gists{/gist_id}',
      gravatar_id: '',
      html_url: 'https://github.com/' + username,
      id: 209966,
      login: username,
      node_id: 'MDQ6VXNlcjIwOTk2Ng==',
      organizations_url: 'https://api.github.com/users/' + username + '/orgs',
      received_events_url:
        'https://api.github.com/users/' + username + '/received_events',
      repos_url: 'https://api.github.com/users/' + username + '/repos',
      site_admin: false,
      starred_url:
        'https://api.github.com/users/' + username + '/starred{/owner}{/repo}',
      subscriptions_url:
        'https://api.github.com/users/' + username + '/subscriptions',
      type: 'User',
      url: 'https://api.github.com/users/' + username,
    },
  };
};
