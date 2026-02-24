import { useDispatch, useSelector } from 'react-redux';

/**
 * Typed dispatch hook.
 * @returns {import('@reduxjs/toolkit').Dispatch}
 */
export const useAppDispatch = () => useDispatch();

/**
 * Typed selector hook.
 * @type {import('react-redux').TypedUseSelectorHook<ReturnType<import('./store.js').store.getState>>}
 */
export const useAppSelector = useSelector;
