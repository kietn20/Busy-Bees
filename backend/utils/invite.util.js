// Purpose of this utility: provides a utility function for generating unique invite codes

const generateInviteCode = async () => {
  const { customAlphabet } = await import('nanoid');
  
  // define the alphabet for the code
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // define the length of the code
  const nanoid = customAlphabet(alphabet, 6);

  // generate the code
  const code = nanoid();
  
  return code;
};

module.exports = {
  generateInviteCode,
};