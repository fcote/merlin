import crypto from 'crypto'

const pbkdf2 = (
  password,
  salt,
  iterations,
  keylen,
  digest
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      iterations,
      keylen,
      digest,
      (err, derivedKey) => {
        if (err) reject(err)
        else resolve(derivedKey.toString('hex'))
      }
    )
  })
}

export { pbkdf2 }
