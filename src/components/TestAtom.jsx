import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { testAtom } from '../stores/atoms/systemAtoms';

const TestAtom = () => {
  try {
    const testValue = useAtomValue(testAtom);
    const setTestValue = useSetAtom(testAtom);
    
    return (
      <div>
        <p>Test atom value: {testValue}</p>
        <button onClick={() => setTestValue('updated')}>
          Update Test Atom
        </button>
      </div>
    );
  } catch (error) {
    console.error('TestAtom error:', error);
    return <div>Error: {error.message}</div>;
  }
};

export default TestAtom;
