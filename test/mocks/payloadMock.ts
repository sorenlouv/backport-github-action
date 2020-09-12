import { EventPayloads } from '@octokit/webhooks';

export const payloadMock: EventPayloads.WebhookPayloadPullRequest = {
  action: 'closed',
  number: 34,
  organization: {
    avatar_url: 'https://avatars0.githubusercontent.com/u/69669900?v=4',
    description: null,
    events_url: 'https://api.github.com/orgs/backport-org/events',
    hooks_url: 'https://api.github.com/orgs/backport-org/hooks',
    id: 69669900,
    issues_url: 'https://api.github.com/orgs/backport-org/issues',
    login: 'backport-org',
    members_url: 'https://api.github.com/orgs/backport-org/members{/member}',
    node_id: 'MDEyOk9yZ2FuaXphdGlvbjY5NjY5OTAw',
    public_members_url:
      'https://api.github.com/orgs/backport-org/public_members{/member}',
    repos_url: 'https://api.github.com/orgs/backport-org/repos',
    url: 'https://api.github.com/orgs/backport-org',
  },
  pull_request: {
    _links: {
      comments: {
        href:
          'https://api.github.com/repos/backport-org/backport-demo/issues/34/comments',
      },
      commits: {
        href:
          'https://api.github.com/repos/backport-org/backport-demo/pulls/34/commits',
      },
      html: {
        href: 'https://github.com/backport-org/backport-demo/pull/34',
      },
      issue: {
        href:
          'https://api.github.com/repos/backport-org/backport-demo/issues/34',
      },
      review_comment: {
        href:
          'https://api.github.com/repos/backport-org/backport-demo/pulls/comments{/number}',
      },
      review_comments: {
        href:
          'https://api.github.com/repos/backport-org/backport-demo/pulls/34/comments',
      },
      self: {
        href:
          'https://api.github.com/repos/backport-org/backport-demo/pulls/34',
      },
      statuses: {
        href:
          'https://api.github.com/repos/backport-org/backport-demo/statuses/1af652f1ad8a1c3bd71522ec3d770171cc79eb61',
      },
    },
    active_lock_reason: null,
    additions: 1,
    assignee: null,
    assignees: [],
    author_association: 'CONTRIBUTOR',
    base: {
      label: 'backport-org:master',
      ref: 'master',
      repo: {
        allow_merge_commit: false,
        allow_rebase_merge: false,
        allow_squash_merge: true,
        archive_url:
          'https://api.github.com/repos/backport-org/backport-demo/{archive_format}{/ref}',
        archived: false,
        assignees_url:
          'https://api.github.com/repos/backport-org/backport-demo/assignees{/user}',
        blobs_url:
          'https://api.github.com/repos/backport-org/backport-demo/git/blobs{/sha}',
        branches_url:
          'https://api.github.com/repos/backport-org/backport-demo/branches{/branch}',
        clone_url: 'https://github.com/backport-org/backport-demo.git',
        collaborators_url:
          'https://api.github.com/repos/backport-org/backport-demo/collaborators{/collaborator}',
        comments_url:
          'https://api.github.com/repos/backport-org/backport-demo/comments{/number}',
        commits_url:
          'https://api.github.com/repos/backport-org/backport-demo/commits{/sha}',
        compare_url:
          'https://api.github.com/repos/backport-org/backport-demo/compare/{base}...{head}',
        contents_url:
          'https://api.github.com/repos/backport-org/backport-demo/contents/{+path}',
        contributors_url:
          'https://api.github.com/repos/backport-org/backport-demo/contributors',
        created_at: '2020-08-14T07:49:15Z',
        default_branch: 'master',
        delete_branch_on_merge: false,
        deployments_url:
          'https://api.github.com/repos/backport-org/backport-demo/deployments',
        //@ts-expect-error
        description: 'Demo repo for testing out backporting',
        disabled: false,
        downloads_url:
          'https://api.github.com/repos/backport-org/backport-demo/downloads',
        events_url:
          'https://api.github.com/repos/backport-org/backport-demo/events',
        fork: false,
        forks: 1,
        forks_count: 1,
        forks_url:
          'https://api.github.com/repos/backport-org/backport-demo/forks',
        full_name: 'backport-org/backport-demo',
        git_commits_url:
          'https://api.github.com/repos/backport-org/backport-demo/git/commits{/sha}',
        git_refs_url:
          'https://api.github.com/repos/backport-org/backport-demo/git/refs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/backport-org/backport-demo/git/tags{/sha}',
        git_url: 'git://github.com/backport-org/backport-demo.git',
        has_downloads: true,
        has_issues: true,
        has_pages: false,
        has_projects: true,
        has_wiki: true,
        homepage: null,
        hooks_url:
          'https://api.github.com/repos/backport-org/backport-demo/hooks',
        html_url: 'https://github.com/backport-org/backport-demo',
        id: 287475646,
        issue_comment_url:
          'https://api.github.com/repos/backport-org/backport-demo/issues/comments{/number}',
        issue_events_url:
          'https://api.github.com/repos/backport-org/backport-demo/issues/events{/number}',
        issues_url:
          'https://api.github.com/repos/backport-org/backport-demo/issues{/number}',
        keys_url:
          'https://api.github.com/repos/backport-org/backport-demo/keys{/key_id}',
        labels_url:
          'https://api.github.com/repos/backport-org/backport-demo/labels{/name}',
        language: null,
        languages_url:
          'https://api.github.com/repos/backport-org/backport-demo/languages',
        license: null,
        merges_url:
          'https://api.github.com/repos/backport-org/backport-demo/merges',
        milestones_url:
          'https://api.github.com/repos/backport-org/backport-demo/milestones{/number}',
        mirror_url: null,
        name: 'backport-demo',
        node_id: 'MDEwOlJlcG9zaXRvcnkyODc0NzU2NDY=',
        notifications_url:
          'https://api.github.com/repos/backport-org/backport-demo/notifications{?since,all,participating}',
        open_issues: 1,
        open_issues_count: 1,
        owner: {
          avatar_url: 'https://avatars0.githubusercontent.com/u/69669900?v=4',
          events_url:
            'https://api.github.com/users/backport-org/events{/privacy}',
          followers_url: 'https://api.github.com/users/backport-org/followers',
          following_url:
            'https://api.github.com/users/backport-org/following{/other_user}',
          gists_url:
            'https://api.github.com/users/backport-org/gists{/gist_id}',
          gravatar_id: '',
          html_url: 'https://github.com/backport-org',
          id: 69669900,
          login: 'backport-org',
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjY5NjY5OTAw',
          organizations_url: 'https://api.github.com/users/backport-org/orgs',
          received_events_url:
            'https://api.github.com/users/backport-org/received_events',
          repos_url: 'https://api.github.com/users/backport-org/repos',
          site_admin: false,
          starred_url:
            'https://api.github.com/users/backport-org/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/backport-org/subscriptions',
          type: 'Organization',
          url: 'https://api.github.com/users/backport-org',
        },
        private: false,
        pulls_url:
          'https://api.github.com/repos/backport-org/backport-demo/pulls{/number}',
        pushed_at: '2020-09-12T18:11:55Z',
        releases_url:
          'https://api.github.com/repos/backport-org/backport-demo/releases{/id}',
        size: 664,
        ssh_url: 'git@github.com:backport-org/backport-demo.git',
        stargazers_count: 0,
        stargazers_url:
          'https://api.github.com/repos/backport-org/backport-demo/stargazers',
        statuses_url:
          'https://api.github.com/repos/backport-org/backport-demo/statuses/{sha}',
        subscribers_url:
          'https://api.github.com/repos/backport-org/backport-demo/subscribers',
        subscription_url:
          'https://api.github.com/repos/backport-org/backport-demo/subscription',
        svn_url: 'https://github.com/backport-org/backport-demo',
        tags_url:
          'https://api.github.com/repos/backport-org/backport-demo/tags',
        teams_url:
          'https://api.github.com/repos/backport-org/backport-demo/teams',
        trees_url:
          'https://api.github.com/repos/backport-org/backport-demo/git/trees{/sha}',
        updated_at: '2020-09-11T22:04:45Z',
        url: 'https://api.github.com/repos/backport-org/backport-demo',
        watchers: 0,
        watchers_count: 0,
      },
      sha: '241cac35ee8e6c1cae400e7cc9145fe505adac9d',
      user: {
        avatar_url: 'https://avatars0.githubusercontent.com/u/69669900?v=4',
        events_url:
          'https://api.github.com/users/backport-org/events{/privacy}',
        followers_url: 'https://api.github.com/users/backport-org/followers',
        following_url:
          'https://api.github.com/users/backport-org/following{/other_user}',
        gists_url: 'https://api.github.com/users/backport-org/gists{/gist_id}',
        gravatar_id: '',
        html_url: 'https://github.com/backport-org',
        id: 69669900,
        login: 'backport-org',
        node_id: 'MDEyOk9yZ2FuaXphdGlvbjY5NjY5OTAw',
        organizations_url: 'https://api.github.com/users/backport-org/orgs',
        received_events_url:
          'https://api.github.com/users/backport-org/received_events',
        repos_url: 'https://api.github.com/users/backport-org/repos',
        site_admin: false,
        starred_url:
          'https://api.github.com/users/backport-org/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/backport-org/subscriptions',
        type: 'Organization',
        url: 'https://api.github.com/users/backport-org',
      },
    },
    body: '',
    changed_files: 1,
    closed_at: '2020-09-12T18:11:56Z',
    comments: 0,
    comments_url:
      'https://api.github.com/repos/backport-org/backport-demo/issues/34/comments',
    commits: 1,
    commits_url:
      'https://api.github.com/repos/backport-org/backport-demo/pulls/34/commits',
    created_at: '2020-09-12T18:11:40Z',
    deletions: 1,
    diff_url: 'https://github.com/backport-org/backport-demo/pull/34.diff',
    draft: false,
    head: {
      label: 'sqren:add-fire',
      ref: 'add-fire',
      repo: {
        allow_merge_commit: true,
        allow_rebase_merge: true,
        allow_squash_merge: true,
        archive_url:
          'https://api.github.com/repos/sqren/backport-demo/{archive_format}{/ref}',
        archived: false,
        assignees_url:
          'https://api.github.com/repos/sqren/backport-demo/assignees{/user}',
        blobs_url:
          'https://api.github.com/repos/sqren/backport-demo/git/blobs{/sha}',
        branches_url:
          'https://api.github.com/repos/sqren/backport-demo/branches{/branch}',
        clone_url: 'https://github.com/sqren/backport-demo.git',
        collaborators_url:
          'https://api.github.com/repos/sqren/backport-demo/collaborators{/collaborator}',
        comments_url:
          'https://api.github.com/repos/sqren/backport-demo/comments{/number}',
        commits_url:
          'https://api.github.com/repos/sqren/backport-demo/commits{/sha}',
        compare_url:
          'https://api.github.com/repos/sqren/backport-demo/compare/{base}...{head}',
        contents_url:
          'https://api.github.com/repos/sqren/backport-demo/contents/{+path}',
        contributors_url:
          'https://api.github.com/repos/sqren/backport-demo/contributors',
        created_at: '2020-09-12T18:10:26Z',
        default_branch: 'master',
        delete_branch_on_merge: false,
        deployments_url:
          'https://api.github.com/repos/sqren/backport-demo/deployments',
        //@ts-expect-error
        description: 'Demo repo for testing out backporting',
        disabled: false,
        downloads_url:
          'https://api.github.com/repos/sqren/backport-demo/downloads',
        events_url: 'https://api.github.com/repos/sqren/backport-demo/events',
        fork: true,
        forks: 0,
        forks_count: 0,
        forks_url: 'https://api.github.com/repos/sqren/backport-demo/forks',
        full_name: 'sqren/backport-demo',
        git_commits_url:
          'https://api.github.com/repos/sqren/backport-demo/git/commits{/sha}',
        git_refs_url:
          'https://api.github.com/repos/sqren/backport-demo/git/refs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/sqren/backport-demo/git/tags{/sha}',
        git_url: 'git://github.com/sqren/backport-demo.git',
        has_downloads: true,
        has_issues: false,
        has_pages: false,
        has_projects: true,
        has_wiki: true,
        homepage: null,
        hooks_url: 'https://api.github.com/repos/sqren/backport-demo/hooks',
        html_url: 'https://github.com/sqren/backport-demo',
        id: 294999879,
        issue_comment_url:
          'https://api.github.com/repos/sqren/backport-demo/issues/comments{/number}',
        issue_events_url:
          'https://api.github.com/repos/sqren/backport-demo/issues/events{/number}',
        issues_url:
          'https://api.github.com/repos/sqren/backport-demo/issues{/number}',
        keys_url:
          'https://api.github.com/repos/sqren/backport-demo/keys{/key_id}',
        labels_url:
          'https://api.github.com/repos/sqren/backport-demo/labels{/name}',
        language: null,
        languages_url:
          'https://api.github.com/repos/sqren/backport-demo/languages',
        license: null,
        merges_url: 'https://api.github.com/repos/sqren/backport-demo/merges',
        milestones_url:
          'https://api.github.com/repos/sqren/backport-demo/milestones{/number}',
        mirror_url: null,
        name: 'backport-demo',
        node_id: 'MDEwOlJlcG9zaXRvcnkyOTQ5OTk4Nzk=',
        notifications_url:
          'https://api.github.com/repos/sqren/backport-demo/notifications{?since,all,participating}',
        open_issues: 0,
        open_issues_count: 0,
        owner: {
          avatar_url: 'https://avatars3.githubusercontent.com/u/209966?v=4',
          events_url: 'https://api.github.com/users/sqren/events{/privacy}',
          followers_url: 'https://api.github.com/users/sqren/followers',
          following_url:
            'https://api.github.com/users/sqren/following{/other_user}',
          gists_url: 'https://api.github.com/users/sqren/gists{/gist_id}',
          gravatar_id: '',
          html_url: 'https://github.com/sqren',
          id: 209966,
          login: 'sqren',
          node_id: 'MDQ6VXNlcjIwOTk2Ng==',
          organizations_url: 'https://api.github.com/users/sqren/orgs',
          received_events_url:
            'https://api.github.com/users/sqren/received_events',
          repos_url: 'https://api.github.com/users/sqren/repos',
          site_admin: false,
          starred_url:
            'https://api.github.com/users/sqren/starred{/owner}{/repo}',
          subscriptions_url: 'https://api.github.com/users/sqren/subscriptions',
          type: 'User',
          url: 'https://api.github.com/users/sqren',
        },
        private: false,
        pulls_url:
          'https://api.github.com/repos/sqren/backport-demo/pulls{/number}',
        pushed_at: '2020-09-12T18:11:01Z',
        releases_url:
          'https://api.github.com/repos/sqren/backport-demo/releases{/id}',
        size: 664,
        ssh_url: 'git@github.com:sqren/backport-demo.git',
        stargazers_count: 0,
        stargazers_url:
          'https://api.github.com/repos/sqren/backport-demo/stargazers',
        statuses_url:
          'https://api.github.com/repos/sqren/backport-demo/statuses/{sha}',
        subscribers_url:
          'https://api.github.com/repos/sqren/backport-demo/subscribers',
        subscription_url:
          'https://api.github.com/repos/sqren/backport-demo/subscription',
        svn_url: 'https://github.com/sqren/backport-demo',
        tags_url: 'https://api.github.com/repos/sqren/backport-demo/tags',
        teams_url: 'https://api.github.com/repos/sqren/backport-demo/teams',
        trees_url:
          'https://api.github.com/repos/sqren/backport-demo/git/trees{/sha}',
        updated_at: '2020-09-12T18:10:28Z',
        url: 'https://api.github.com/repos/sqren/backport-demo',
        watchers: 0,
        watchers_count: 0,
      },
      sha: '1af652f1ad8a1c3bd71522ec3d770171cc79eb61',
      user: {
        avatar_url: 'https://avatars3.githubusercontent.com/u/209966?v=4',
        events_url: 'https://api.github.com/users/sqren/events{/privacy}',
        followers_url: 'https://api.github.com/users/sqren/followers',
        following_url:
          'https://api.github.com/users/sqren/following{/other_user}',
        gists_url: 'https://api.github.com/users/sqren/gists{/gist_id}',
        gravatar_id: '',
        html_url: 'https://github.com/sqren',
        id: 209966,
        login: 'sqren',
        node_id: 'MDQ6VXNlcjIwOTk2Ng==',
        organizations_url: 'https://api.github.com/users/sqren/orgs',
        received_events_url:
          'https://api.github.com/users/sqren/received_events',
        repos_url: 'https://api.github.com/users/sqren/repos',
        site_admin: false,
        starred_url:
          'https://api.github.com/users/sqren/starred{/owner}{/repo}',
        subscriptions_url: 'https://api.github.com/users/sqren/subscriptions',
        type: 'User',
        url: 'https://api.github.com/users/sqren',
      },
    },
    html_url: 'https://github.com/backport-org/backport-demo/pull/34',
    id: 485979020,
    issue_url:
      'https://api.github.com/repos/backport-org/backport-demo/issues/34',
    labels: [],
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
      events_url: 'https://api.github.com/users/sqren/events{/privacy}',
      followers_url: 'https://api.github.com/users/sqren/followers',
      following_url:
        'https://api.github.com/users/sqren/following{/other_user}',
      gists_url: 'https://api.github.com/users/sqren/gists{/gist_id}',
      gravatar_id: '',
      html_url: 'https://github.com/sqren',
      id: 209966,
      login: 'sqren',
      node_id: 'MDQ6VXNlcjIwOTk2Ng==',
      organizations_url: 'https://api.github.com/users/sqren/orgs',
      received_events_url: 'https://api.github.com/users/sqren/received_events',
      repos_url: 'https://api.github.com/users/sqren/repos',
      site_admin: false,
      starred_url: 'https://api.github.com/users/sqren/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/sqren/subscriptions',
      type: 'User',
      url: 'https://api.github.com/users/sqren',
    },
    milestone: null,
    node_id: 'MDExOlB1bGxSZXF1ZXN0NDg1OTc5MDIw',
    number: 34,
    patch_url: 'https://github.com/backport-org/backport-demo/pull/34.patch',
    rebaseable: null,
    requested_reviewers: [],
    requested_teams: [],
    review_comment_url:
      'https://api.github.com/repos/backport-org/backport-demo/pulls/comments{/number}',
    review_comments: 0,
    review_comments_url:
      'https://api.github.com/repos/backport-org/backport-demo/pulls/34/comments',
    state: 'closed',
    statuses_url:
      'https://api.github.com/repos/backport-org/backport-demo/statuses/1af652f1ad8a1c3bd71522ec3d770171cc79eb61',
    title: 'Add fire emoji',
    updated_at: '2020-09-12T18:11:56Z',
    url: 'https://api.github.com/repos/backport-org/backport-demo/pulls/34',
    user: {
      avatar_url: 'https://avatars3.githubusercontent.com/u/209966?v=4',
      events_url: 'https://api.github.com/users/sqren/events{/privacy}',
      followers_url: 'https://api.github.com/users/sqren/followers',
      following_url:
        'https://api.github.com/users/sqren/following{/other_user}',
      gists_url: 'https://api.github.com/users/sqren/gists{/gist_id}',
      gravatar_id: '',
      html_url: 'https://github.com/sqren',
      id: 209966,
      login: 'sqren',
      node_id: 'MDQ6VXNlcjIwOTk2Ng==',
      organizations_url: 'https://api.github.com/users/sqren/orgs',
      received_events_url: 'https://api.github.com/users/sqren/received_events',
      repos_url: 'https://api.github.com/users/sqren/repos',
      site_admin: false,
      starred_url: 'https://api.github.com/users/sqren/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/sqren/subscriptions',
      type: 'User',
      url: 'https://api.github.com/users/sqren',
    },
  },
  repository: {
    archive_url:
      'https://api.github.com/repos/backport-org/backport-demo/{archive_format}{/ref}',
    archived: false,
    assignees_url:
      'https://api.github.com/repos/backport-org/backport-demo/assignees{/user}',
    blobs_url:
      'https://api.github.com/repos/backport-org/backport-demo/git/blobs{/sha}',
    branches_url:
      'https://api.github.com/repos/backport-org/backport-demo/branches{/branch}',
    clone_url: 'https://github.com/backport-org/backport-demo.git',
    collaborators_url:
      'https://api.github.com/repos/backport-org/backport-demo/collaborators{/collaborator}',
    comments_url:
      'https://api.github.com/repos/backport-org/backport-demo/comments{/number}',
    commits_url:
      'https://api.github.com/repos/backport-org/backport-demo/commits{/sha}',
    compare_url:
      'https://api.github.com/repos/backport-org/backport-demo/compare/{base}...{head}',
    contents_url:
      'https://api.github.com/repos/backport-org/backport-demo/contents/{+path}',
    contributors_url:
      'https://api.github.com/repos/backport-org/backport-demo/contributors',
    created_at: '2020-08-14T07:49:15Z',
    default_branch: 'master',
    deployments_url:
      'https://api.github.com/repos/backport-org/backport-demo/deployments',
    description: 'Demo repo for testing out backporting',
    disabled: false,
    downloads_url:
      'https://api.github.com/repos/backport-org/backport-demo/downloads',
    events_url:
      'https://api.github.com/repos/backport-org/backport-demo/events',
    fork: false,
    forks: 1,
    forks_count: 1,
    forks_url: 'https://api.github.com/repos/backport-org/backport-demo/forks',
    full_name: 'backport-org/backport-demo',
    git_commits_url:
      'https://api.github.com/repos/backport-org/backport-demo/git/commits{/sha}',
    git_refs_url:
      'https://api.github.com/repos/backport-org/backport-demo/git/refs{/sha}',
    git_tags_url:
      'https://api.github.com/repos/backport-org/backport-demo/git/tags{/sha}',
    git_url: 'git://github.com/backport-org/backport-demo.git',
    has_downloads: true,
    has_issues: true,
    has_pages: false,
    has_projects: true,
    has_wiki: true,
    homepage: null,
    hooks_url: 'https://api.github.com/repos/backport-org/backport-demo/hooks',
    html_url: 'https://github.com/backport-org/backport-demo',
    id: 287475646,
    issue_comment_url:
      'https://api.github.com/repos/backport-org/backport-demo/issues/comments{/number}',
    issue_events_url:
      'https://api.github.com/repos/backport-org/backport-demo/issues/events{/number}',
    issues_url:
      'https://api.github.com/repos/backport-org/backport-demo/issues{/number}',
    keys_url:
      'https://api.github.com/repos/backport-org/backport-demo/keys{/key_id}',
    labels_url:
      'https://api.github.com/repos/backport-org/backport-demo/labels{/name}',
    language: null,
    languages_url:
      'https://api.github.com/repos/backport-org/backport-demo/languages',
    license: null,
    merges_url:
      'https://api.github.com/repos/backport-org/backport-demo/merges',
    milestones_url:
      'https://api.github.com/repos/backport-org/backport-demo/milestones{/number}',
    mirror_url: null,
    name: 'backport-demo',
    node_id: 'MDEwOlJlcG9zaXRvcnkyODc0NzU2NDY=',
    notifications_url:
      'https://api.github.com/repos/backport-org/backport-demo/notifications{?since,all,participating}',
    open_issues: 1,
    open_issues_count: 1,
    owner: {
      avatar_url: 'https://avatars0.githubusercontent.com/u/69669900?v=4',
      events_url: 'https://api.github.com/users/backport-org/events{/privacy}',
      followers_url: 'https://api.github.com/users/backport-org/followers',
      following_url:
        'https://api.github.com/users/backport-org/following{/other_user}',
      gists_url: 'https://api.github.com/users/backport-org/gists{/gist_id}',
      gravatar_id: '',
      html_url: 'https://github.com/backport-org',
      id: 69669900,
      login: 'backport-org',
      node_id: 'MDEyOk9yZ2FuaXphdGlvbjY5NjY5OTAw',
      organizations_url: 'https://api.github.com/users/backport-org/orgs',
      received_events_url:
        'https://api.github.com/users/backport-org/received_events',
      repos_url: 'https://api.github.com/users/backport-org/repos',
      site_admin: false,
      starred_url:
        'https://api.github.com/users/backport-org/starred{/owner}{/repo}',
      subscriptions_url:
        'https://api.github.com/users/backport-org/subscriptions',
      type: 'Organization',
      url: 'https://api.github.com/users/backport-org',
    },
    private: false,
    pulls_url:
      'https://api.github.com/repos/backport-org/backport-demo/pulls{/number}',
    pushed_at: '2020-09-12T18:11:55Z',
    releases_url:
      'https://api.github.com/repos/backport-org/backport-demo/releases{/id}',
    size: 664,
    ssh_url: 'git@github.com:backport-org/backport-demo.git',
    stargazers_count: 0,
    stargazers_url:
      'https://api.github.com/repos/backport-org/backport-demo/stargazers',
    statuses_url:
      'https://api.github.com/repos/backport-org/backport-demo/statuses/{sha}',
    subscribers_url:
      'https://api.github.com/repos/backport-org/backport-demo/subscribers',
    subscription_url:
      'https://api.github.com/repos/backport-org/backport-demo/subscription',
    svn_url: 'https://github.com/backport-org/backport-demo',
    tags_url: 'https://api.github.com/repos/backport-org/backport-demo/tags',
    teams_url: 'https://api.github.com/repos/backport-org/backport-demo/teams',
    trees_url:
      'https://api.github.com/repos/backport-org/backport-demo/git/trees{/sha}',
    updated_at: '2020-09-11T22:04:45Z',
    url: 'https://api.github.com/repos/backport-org/backport-demo',
    watchers: 0,
    watchers_count: 0,
  },
  sender: {
    avatar_url: 'https://avatars3.githubusercontent.com/u/209966?v=4',
    events_url: 'https://api.github.com/users/sqren/events{/privacy}',
    followers_url: 'https://api.github.com/users/sqren/followers',
    following_url: 'https://api.github.com/users/sqren/following{/other_user}',
    gists_url: 'https://api.github.com/users/sqren/gists{/gist_id}',
    gravatar_id: '',
    html_url: 'https://github.com/sqren',
    id: 209966,
    login: 'sqren',
    node_id: 'MDQ6VXNlcjIwOTk2Ng==',
    organizations_url: 'https://api.github.com/users/sqren/orgs',
    received_events_url: 'https://api.github.com/users/sqren/received_events',
    repos_url: 'https://api.github.com/users/sqren/repos',
    site_admin: false,
    starred_url: 'https://api.github.com/users/sqren/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/sqren/subscriptions',
    type: 'User',
    url: 'https://api.github.com/users/sqren',
  },
};
