
import { useReducer } from "react";
import { IstateTypes } from "types/feed/vdoType";

const initialValue = {
  limit: 5,
  option: "FOR_YOU",
  searchKeyword: null,
};

const ACTION_TYPE = {
  LIMIT: "LIMIT",
  OPTION: "OPTION",
  SEARCH: "SEARCH",
};

const reducer = (
  state: IstateTypes,
  action: { type: string; payload?: any }
) => {
  switch (action.type) {
    case ACTION_TYPE.LIMIT:
      return {
        ...state,
        limit: action.payload || state.limit,
      };
    case ACTION_TYPE.OPTION:
      return {
        ...state,
        option: action.payload || state.option,
      };
    case ACTION_TYPE.SEARCH:
      return {
        ...state,
        searchKeyword: action.payload || null,
      };
    default:
      return state;
  }
};

const useFeedVdoFilter = () => {
  const [state, dispatch] = useReducer(reducer, initialValue);

  return {
    state,
    dispatch,
    ACTION_TYPE,
  };
};

export default useFeedVdoFilter;
