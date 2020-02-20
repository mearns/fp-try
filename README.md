# fp-try

A functional-programming-esque `Try` interface, inspired by the Scala type. A `Try` represents
the results of an operation that may have failed, encapsulating either the successful result
as a `Success`, or the error as a `Failure`.

```typescript
const DEFAULT_USER: User = buildDefaultUser();

function getUser(userName: string): User {
    return Try.apply(getDatabaseCredentials)
        .map((c: Creds) => fetchUserDetails(c, userName))
        .map(mapResultsToUser)
        .getOrElse(DEFAULT_USER);
}

function getDatabaseCredentials(): Creds {
    /* ... */
}

function fetchUserDetails(c: Creds, userName: string): ResultSet {
    /* ... */
}

function mapResultsToUser(rs: ResultSet): User {
    /* ... */
}
```

There are a lot of anti-patterns with this type. For more information on how to use
it effectively, see our article:
["Do or Do Not: Patterns and Antipatterns with the Try type"](https://medium.com/software-ascending/do-or-do-not-patterns-and-antipatterns-with-the-try-type-c77a63f74cc9)
