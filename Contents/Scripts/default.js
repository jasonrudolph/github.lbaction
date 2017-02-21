let module = {exports: {}};

include('cache.js');
const cache = new Cache();

include('account.js');
include('commit.js');
include('graphql.js');
include('issue.js');
include('link-shortener.js');
include('pull-request.js');
include('repository.js');

class GitHubLB {
  run(input, options) {
    var defaultItems = [
      {
        title: "My Gists",
        url: "url",
        icon: 'gist.png',
      },
      {
        title: "My Issues",
        url: "url",
        icon: 'issue.png',
      },
      {
        title: "My Pull Requests",
        url: "url",
        icon: 'pull-request.png',
      },
      {
        title: "My Repositories",
        url: "url",
        icon: 'repo.png',
      },
    ];

    if (input.length > 0) {
      function isMatch(item) {
        var regex = new RegExp(input, "i")
        return item.title.match(regex);
      }
      return defaultItems.filter(isMatch);
    } else {
      return defaultItems;
    }
  }

  openLinkShortnerMenu(link, options) {
    if (LaunchBar.options.commandKey == 1) {
      this.shortenLink(link);
    } else {
      return [
        {
          title: 'Shorten link',
          icon: 'link.png',
          action: 'shortenLink',
          actionArgument: link,
        },
      ];
    }
  }

  openRepositoryMenu(repository) {
    if (LaunchBar.options.commandKey == 1) {
      LaunchBar.openURL(repository.url);
    } else {
      return [
        {
          title: 'View Repository',
          subtitle: repository.nameWithOwner,
          alwaysShowsSubtitle: true,
          icon: 'repo.png',
          url: repository.url,
        },
        {
          title: 'View Issues',
          icon: 'issue.png',
          url: repository.issuesURL,
        },
        {
          title: 'View Pull Requests',
          icon: 'pull-request.png',
          url: repository.pullRequestsURL,
        }
      ];
    }
  }

  openCommitPullRequestsMenu(commit) {
    if (commit.pullRequests().length > 1) {
      return commit.pullRequests().map(function(pr) { return pr.toMenuItem(); });
    } else {
      LaunchBar.openURL(commit.pullRequests()[0].url);
    }
  }

  openAccountMenu(account) {
    if (LaunchBar.options.commandKey == 1) {
      LaunchBar.openURL(account.profileURL);
    } else {
      return [
        {
          title: 'View Profile',
          subtitle: account.handle,
          alwaysShowsSubtitle: true,
          icon: 'person.png',
          url: account.profileURL,
        },
        {
          title: 'View Repositories',
          icon: 'repo.png',
          action: 'openAccountRepositories',
          actionArgument: account.login,
          actionReturnsItems: true,
        },
        {
          title: 'View Issues',
          icon: 'issue.png',
          url: account.issuesURL,
        },
        {
          title: 'View Pull Requests',
          icon: 'pull-request.png',
          url: account.pullRequestsURL,
        },
        {
          title: 'View Gists',
          icon: 'gist.png',
          url: account.gistsURL,
        }
      ];
    }
  }

  openAccountRepositoriesMenu(login) {
    let account = new Account(login);

    if (LaunchBar.options.commandKey == 1) {
      LaunchBar.openURL(account.repositoriesURL);
    } else {
      return [
        {
          title: 'View All Repositories',
          icon: 'repos.png',
          url: account.repositoriesURL,
        }
      ].concat(account.repositories().map(function(repository) {
        return repository.toMenuItem();
      }));
    }
  }

  shortenLink(link) {
    let linkShortener = new LinkShortener(link);
    let shortLink     = linkShortener.run();

    LaunchBar.setClipboardString(shortLink);
    LaunchBar.displayNotification({
      title: 'Copied ' + shortLink + ' to your clipboard',
    });
  }

  setToken(token) {
    Action.preferences.token = token;
    LaunchBar.displayNotification({
      title: 'GitHub access token set successfully',
    });
  }
}

let app = new GitHubLB();

function run(argument) {
  return app.run(argument);
}

function runWithString(string) {
  return app.run(string);
}

function runWithURL(url, details) {
  return app.run(url, details);
}

// Unfortunately when the script output uses an action argument (like
// openAccount does), it needs to be able to find the function from the global
// scope. The following functions are workarounds to the appropriate actions.
//
// https://developer.obdev.at/launchbar-developer-documentation/#/script-output.
function openAccountRepositories(string) {
  return app.openAccountRepositoriesMenu(string);
}

function shortenLink(link, details) {
  return app.shortenLink(link);
}
