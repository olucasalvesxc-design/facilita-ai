# Security Specification - Facilita Aí

## 1. Data Invariants
- **Users**: Each user document ID must match their auth UID. Users can only edit their own profile.
- **Professionals**: A professional record must belong to a valid user. Professional profiles are public (read-only for others).
- **Orders**: An order must have both a `clientId` and a `professionalId`. Only the client or the professional can read/update an order.
- **Chats**: Chats are private between the two participants. Message IDs are usually set by the system (subcollection).
- **Notifications**: Notifications are private to the recipient.

## 2. The "Dirty Dozen" Payloads (Denial Expected)
1. Delete a professional profile you don't own. (`delete /professionals/otherUserId`)
2. Read all orders in the system. (`getDocs(collection(db, 'orders'))`)
3. Create an order with another user as `clientId`. (`addDoc(collection(db, 'orders'), { clientId: 'malicious', ... })`)
4. Update an order's price after it's been accepted.
5. Create a chat room and add a third party as participant.
6. Read private messages from a chat you are not part of.
7. Send a notification with a forged `senderId`.
8. Update a notification's `message` field (should only allow updating `read` status).
9. Change your own user role to 'admin' (if such a field exists and isn't protected).
10. Register as a professional with a forged `userId`.
11. List all users' private info (if any).
12. Poison document IDs with huge strings to cause resource exhaustion.

## 3. Test Runner (Draft)
The `firestore.rules.test.ts` will verify these denials.
