export function defaultCatch(res) {
  return (err) => {
    console.error(err);
    res.statusCode = 500;
    res.send('500');
  };
}
