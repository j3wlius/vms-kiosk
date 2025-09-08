import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { atom } from 'jotai';

// Create a simple atom directly in the component file
const simpleAtom = atom('hello');

const SimpleTest = () => {
  try {
    const value = useAtomValue(simpleAtom);
    const setValue = useSetAtom(simpleAtom);
    
    return (
      <div>
        <h1>Simple Test</h1>
        <p>Value: {value}</p>
        <button onClick={() => setValue('updated!')}>
          Update
        </button>
      </div>
    );
  } catch (error) {
    console.error('SimpleTest error:', error);
    return <div>Error: {error.message}</div>;
  }
};

export default SimpleTest;
