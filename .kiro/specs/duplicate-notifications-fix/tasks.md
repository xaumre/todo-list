# Implementation Plan

- [x] 1. Remove duplicate success notification in authentication flow
  - [x] 1.1 Remove AuthUI success message call in handleAuthSuccess()
    - Modify `app.js` line ~254 to remove `authUI.displaySuccess('Login successful!', formType);`
    - Keep only the toast notification for operation feedback
    - _Requirements: 1.1, 1.2, 2.1_

  - [ ]* 1.2 Write property test for single notification per operation
    - **Property 1: Single notification per operation**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.5**

- [x] 2. Verify authentication error notification behavior
  - [x] 2.1 Review and document authentication error notification pattern
    - Analyze `handleAuthSuccess()` error path (line ~266-269)
    - Determine if both toast and inline are needed for auth errors
    - Document decision in code comments
    - _Requirements: 2.1, 4.2_

  - [x] 2.2 Implement consistent error notification for authentication failures
    - If both notifications are redundant, remove one (likely remove toast, keep inline for context)
    - If both serve different purposes, document why in comments
    - _Requirements: 2.3, 4.4_

  - [ ]* 2.3 Write property test for operations using toast notifications
    - **Property 2: Operations use toast notifications**
    - **Validates: Requirements 2.1, 2.2, 2.3, 4.2, 4.3, 4.4**

- [x] 3. Verify form validation notification behavior
  - [x] 3.1 Audit form validation error handling
    - Review AuthUI validation error display in login and registration forms
    - Verify no toast notifications are triggered for validation errors
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 3.2 Write property test for validation errors using inline messages
    - **Property 3: Validation errors use inline messages**
    - **Validates: Requirements 2.4, 3.1, 3.2, 3.3**

  - [ ]* 3.3 Write property test for validation error clearing
    - **Property 4: Validation error clearing**
    - **Validates: Requirements 3.4**

- [ ] 4. Verify task operation notification behavior
  - [x] 4.1 Audit task operation notifications
    - Review task add, delete, and toggle operations in `app.js`
    - Verify only toast notifications are used (lines ~161, ~184, ~210)
    - Confirm no duplicate notifications exist
    - _Requirements: 1.5, 2.2_

- [x] 5. Handle session expiration notification special case
  - [x] 5.1 Document session expiration dual notification pattern
    - Add code comments in `handleAuthenticationError()` explaining why both toast and inline are used
    - Toast provides immediate attention, inline provides persistent context
    - _Requirements: 5.1, 5.2_

  - [x] 5.2 Verify session expiration clears existing toasts
    - Check if `handleAuthenticationError()` should call `toast.dismissAll()` before showing session expiration
    - Implement if needed
    - _Requirements: 5.3_

  - [ ]* 5.3 Write unit tests for session expiration notification behavior
    - Test that session expiration shows exactly one toast
    - Test that session expiration shows inline message
    - Test that existing toasts are cleared before session expiration notification
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Update documentation
  - [x] 7.1 Add notification decision matrix to code comments
    - Document when to use toast vs inline messages
    - Add reference to design document
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 7.2 Update README with notification guidelines
    - Add section explaining notification patterns
    - Provide examples for developers
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
