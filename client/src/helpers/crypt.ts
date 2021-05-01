import crypto from 'crypto-js'

const encrypt = (txt: string, secret: string) => {
  return crypto.AES.encrypt(txt, secret).toString()
}

const decrypt = (ciphertext: string, secret: string) => {
  const bytes = crypto.AES.decrypt(ciphertext, secret)
  return bytes.toString(crypto.enc.Utf8)
}

export { encrypt, decrypt }
