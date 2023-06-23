module.exports = {
    namespace: "GIT",
    commands: [
        {
            name: "Generate Changelog",
            template: `Generate changelog in keepachangelog.com format.
            Add tags at h2 level and subsections at h3 level. 
            Skip unreleased section, skip heading section.
            Use base repository name {user.repositoryPath} for links.
            
            Subsections and description are below. Skip subsections that dont have any info for a given tag:
            Added -  for new features.
            Changed - for changes in existing functionality.
            Deprecated -  for soon-to-be removed features.
            Removed - for now removed features.
            Fixed - for any bug fixes.
            Security - in case of vulnerabilities.
            
            Commit and tag information to use for generating changelog:
            {system.commitAndTagList}`,
        }
    ],
    functions: [
        {
        }
    ],
    variables: [
        {
            name: "repositoryPath",
            value: "https://github.com/username/project",
        },
    ]
};