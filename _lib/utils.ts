async function sleep(millisecond: number = 5 * 1000): Promise<void> {
  return new Promise((res) => setTimeout(res, millisecond));
}

export {
  sleep
};
