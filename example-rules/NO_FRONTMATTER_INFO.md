This rule file intentionally has no YAML front-matter.

It should not be picked up by `ListAlwaysRules` or `ListAgentRequestedRules` unless its path is explicitly provided or matched by a very generic glob that doesn't rely on front-matter existence for initial filtering by the server (which is unlikely for these specific tools).
