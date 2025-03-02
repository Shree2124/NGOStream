export function generatePassword(
  length: number = 12,
  includeUppercase: boolean = true,
  includeLowercase: boolean = true,
  includeNumbers: boolean = true,
  includeSpecial: boolean = true
): string {
  // Define character sets
  const uppercaseChars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars: string = "abcdefghijklmnopqrstuvwxyz";
  const numberChars: string = "0123456789";

  // Create the character pool based on inclusion parameters
  let charPool: string = "";
  if (includeUppercase) charPool += uppercaseChars;
  if (includeLowercase) charPool += lowercaseChars;
  if (includeNumbers) charPool += numberChars;

  // Ensure at least one character set is selected
  if (charPool.length === 0) {
    throw new Error("At least one character set must be included");
  }

  // Generate the password
  let password: string = "";
  for (let i = 0; i < length; i++) {
    const randomIndex: number = Math.floor(Math.random() * charPool.length);
    password += charPool[randomIndex];
  }

  return password;
}
