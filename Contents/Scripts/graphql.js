let GraphQL = {};

GraphQL.execute = function(query, variables) {
  if (!Action.preferences.token) {
    LaunchBar.openURL('https://github.com/settings/tokens');
    LaunchBar.alert("It looks like this is the first time you're using " +
      "this action.\n\nPlease go to https://github.com/settings/tokens " +
      "and create token with 'repo' and 'user' scope and set it by invoking " +
      "the github action and going to settings.");
    return;
  }

  let result = HTTP.post('https://api.github.com/graphql', {
    headerFields: { authorization: 'token ' + Action.preferences.token },
    body: JSON.stringify({ query: query, variables: variables })
  });

  LaunchBar.debugLog(JSON.stringify(result));

  if (result.data) {
    let body = JSON.parse(result.data);

    if (body.data) {
      return body;
    } else {
      LaunchBar.displayNotification({title: "Couldn't access the GitHub API"});
      return [];
    }
  }
};

if (typeof module !== 'undefined') { module.exports.GraphQL = GraphQL; }