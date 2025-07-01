import React from 'react';

describe('React.act check', () => {
  it('should have React.act', () => {
    console.log('React.act:', React.act);
    expect(typeof React.act).toBe('function');
  });
});
