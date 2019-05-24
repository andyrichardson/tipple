const err = console.error;

jest
  .spyOn(console, 'error')
  .mockImplementation((arg: string) =>
    arg.indexOf('act(...)') === -1 ? err(arg) : false
  );
