import { UnderflowError } from '../../src/core/underflow-error';

describe('core/underflow-error', () => {
  let throwUnderflowError = (m? : string) => {
    throw new UnderflowError(m);
  };
  it("instanceof", () => {
    expect(throwUnderflowError).toThrow(UnderflowError);
  });
  it("message", () => {
    try {
      throwUnderflowError("TestMessage");
      fail("Should not be reachable");
    } catch(e) {
      expect(e).toBeInstanceOf(UnderflowError);
      let x = e as UnderflowError;
      expect(x.message).toEqual("TestMessage");
    }
  });
  it("name", () => {
    try {
      throwUnderflowError();
      fail("Should not be reachable");
    } catch(e) {
      expect(e).toBeInstanceOf(UnderflowError);
      let x = e as UnderflowError;
      expect(x.name).toEqual("UnderflowError");
    }
  });
  it("stack", () => {
    try {
      throwUnderflowError();
      fail("Should not be reachable");
    } catch(e) {
      expect(e).toBeInstanceOf(UnderflowError);
      let x = e as UnderflowError;
      expect(x.stack).toBeDefined();
    }
  });
});
