model Admin {
  id           String @id @default(cuid())
  email        String @unique
  passwordHash String
  name String @default("")
  active Boolean @default(true)
  roleId String?
  role Role? @relation(fields: [roleId], references: [id])
  createdAt DateTime @default(now())
  sessions     AdminSession[]
}
model AdminSession {
  tokenHash String @id
  adminId   String
  expiresAt DateTime
  admin     Admin @relation(fields: [adminId], references: [id], onDelete: Cascade)
}
model LoginThrottle {
  key      String @id
  attempts Int
  resetAt  DateTime
}
model Role {
  id              String @id @default(cuid())
  slug            String @unique
  name            String
  permissionsJson String
  admins          Admin[]
}
model AuditLog {
  id        String @id @default(cuid())
  actorId   String?
  actor     String
  action    String
  target    String @default("")
  details   String @default("{}")
  success   Boolean @default(true)
  createdAt DateTime @default(now())
  @@index([createdAt])
}
