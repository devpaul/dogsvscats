Feature: Vote

    Feature Description

    Scenario Outline: User Voting
        Given we are on the <environment>
        And we have not voted
        And there is a record of vote results
        When we vote for a "cat"
        Then the vote for "cat" increases

        Examples:
            | environment |
            | api         |
    # | client      |

    Scenario Outline: User changes their vote
        Given we are on the <environment>
        And we have voted for a "dog"
        And there is a record of vote results
        When we vote for a "cat"
        Then the vote chages from "dog" to "cat"

        Examples:
            | environment |
            | api         |
# | client      |
