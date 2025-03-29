"use client";

import { useState, useEffect } from "react";

type Operation = '+' | '-' | '*' | '/' | '%' | '√' | 'x²' | '1/x';
type CalculatorMode = 'basic' | 'scientific';

export default function Calculator() {
  const [input, setInput] = useState<string>('0');
  const [previousInput, setPreviousInput] = useState<string>('');
  const [operation, setOperation] = useState<Operation | null>(null);
  const [overwrite, setOverwrite] = useState<boolean>(true);
  const [memory, setMemory] = useState<number>(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/[0-9]/.test(e.key)) {
        handleNumberInput(e.key);
      } else if (e.key === '.') {
        handleDecimalInput();
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        handleOperation(e.key as Operation);
      } else if (e.key === 'Enter' || e.key === '=') {
        handleEquals();
      } else if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, previousInput, operation]);

  const handleNumberInput = (num: string) => {
    if (input === '0' || overwrite) {
      setInput(num);
      setOverwrite(false);
    } else {
      setInput(`${input}${num}`);
    }
  };

  const handleDecimalInput = () => {
    if (overwrite) {
      setInput('0.');
      setOverwrite(false);
      return;
    }

    if (!input.includes('.')) {
      setInput(`${input}.`);
    }
  };

  const handleOperation = (op: Operation) => {
    if (input === '0' && previousInput && !overwrite) {
      setOperation(op);
      return;
    }

    if (previousInput && !overwrite) {
      const result = calculate();
      setInput(String(result));
      setPreviousInput(String(result));
    } else {
      setPreviousInput(input);
    }

    setOverwrite(true);
    setOperation(op);
  };

  const handleEquals = () => {
    if (!operation || !previousInput) return;

    const result = calculate();
    setInput(String(result));
    setPreviousInput('');
    setOperation(null);
    setOverwrite(true);
  };

  const calculate = (): number => {
    const current = parseFloat(input);
    const previous = parseFloat(previousInput);

    if (isNaN(previous)) return current;

    switch (operation) {
      case '+': return previous + current;
      case '-': return previous - current;
      case '*': return previous * current;
      case '/': return previous / current;
      case '%': return previous % current;
      default: return current;
    }
  };

  const handleClear = () => {
    setInput('0');
    setPreviousInput('');
    setOperation(null);
    setOverwrite(true);
  };

  const handleBackspace = () => {
    if (overwrite) return;
    
    if (input.length === 1 || (input.length === 2 && input.startsWith('-'))) {
      setInput('0');
      setOverwrite(true);
    } else {
      setInput(input.slice(0, -1));
    }
  };

  const handleSpecialOperation = (op: Operation) => {
    const current = parseFloat(input);
    let result = current;

    switch (op) {
      case '√': result = Math.sqrt(current); break;
      case 'x²': result = Math.pow(current, 2); break;
      case '1/x': result = 1 / current; break;
    }

    setInput(String(result));
    setOverwrite(true);
  };

  const handleMemoryOperation = (op: 'MC' | 'MR' | 'M+' | 'M-') => {
    const current = parseFloat(input);
    
    switch (op) {
      case 'MC': setMemory(0); break;
      case 'MR': setInput(String(memory)); break;
      case 'M+': setMemory(prev => prev + current); break;
      case 'M-': setMemory(prev => prev - current); break;
    }

    setOverwrite(true);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const buttonClass = (color: string, colSpan = 1) => 
    `h-16 rounded-lg text-xl font-medium transition-all flex items-center justify-center
    ${theme === 'light' 
      ? `${color} text-gray-800 hover:brightness-95 active:scale-95` 
      : `${color.replace('bg-', 'bg-dark-')} text-white hover:brightness-110 active:scale-95`}
    ${colSpan === 2 ? 'col-span-2' : ''}`;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'}`}>
      <div className={`w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl ${theme === 'light' ? 'bg-white' : 'bg-gray-800'}`}>
        {/* Header */}
        <div className={`p-5 flex justify-between items-center ${theme === 'light' ? 'bg-blue-600' : 'bg-blue-800'}`}>
          <h1 className="text-2xl font-bold text-white">Calculator</h1>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white bg-opacity-20 text-white"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Display */}
        <div className={`p-5 ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'}`}>
          <div className={`h-8 text-right text-lg ${theme === 'light' ? 'text-gray-500' : 'text-gray-300'}`}>
            {previousInput} {operation}
          </div>
          <div className={`h-16 text-right text-5xl font-bold truncate ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
            {input}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-3 p-5">
          {/* Memory Functions */}
          <button onClick={() => handleMemoryOperation('MC')} className={buttonClass('bg-gray-300')}>MC</button>
          <button onClick={() => handleMemoryOperation('MR')} className={buttonClass('bg-gray-300')}>MR</button>
          <button onClick={() => handleMemoryOperation('M+')} className={buttonClass('bg-gray-300')}>M+</button>
          <button onClick={() => handleMemoryOperation('M-')} className={buttonClass('bg-gray-300')}>M-</button>

          {/* First Row */}
          <button onClick={handleClear} className={buttonClass('bg-red-400')}>C</button>
          <button onClick={handleBackspace} className={buttonClass('bg-gray-300')}>⌫</button>
          <button onClick={() => handleSpecialOperation('%')} className={buttonClass('bg-gray-300')}>%</button>
          <button onClick={() => handleOperation('/')} className={buttonClass('bg-blue-400')}>÷</button>

          {/* Scientific Operations */}
          <button onClick={() => handleSpecialOperation('√')} className={buttonClass('bg-gray-300')}>√</button>
          <button onClick={() => handleSpecialOperation('x²')} className={buttonClass('bg-gray-300')}>x²</button>
          <button onClick={() => handleSpecialOperation('1/x')} className={buttonClass('bg-gray-300')}>1/x</button>
          <button onClick={() => handleOperation('*')} className={buttonClass('bg-blue-400')}>×</button>

          {/* Number Rows */}
          {[7, 8, 9].map(num => (
            <button key={num} onClick={() => handleNumberInput(num.toString())} className={buttonClass('bg-gray-200')}>
              {num}
            </button>
          ))}
          <button onClick={() => handleOperation('-')} className={buttonClass('bg-blue-400')}>-</button>

          {[4, 5, 6].map(num => (
            <button key={num} onClick={() => handleNumberInput(num.toString())} className={buttonClass('bg-gray-200')}>
              {num}
            </button>
          ))}
          <button onClick={() => handleOperation('+')} className={buttonClass('bg-blue-400')}>+</button>

          {/* Bottom Row */}
          {[1, 2, 3].map(num => (
            <button key={num} onClick={() => handleNumberInput(num.toString())} className={buttonClass('bg-gray-200')}>
              {num}
            </button>
          ))}
          <button onClick={handleEquals} className={buttonClass('bg-green-500')}>=</button>

          <button onClick={() => handleNumberInput('0')} className={buttonClass('bg-gray-200', 2)}>0</button>
          <button onClick={handleDecimalInput} className={buttonClass('bg-gray-200')}>.</button>
        </div>
      </div>
    </div>
  );
}