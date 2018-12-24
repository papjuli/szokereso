declare function getUserProfile(): any;

function myEmailAddress(): string {
    return getUserProfile().getEmail();
}
