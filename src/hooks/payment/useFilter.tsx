import React from "react";

const initialState = {
  pageRow: null,
  status: null,
  pageLimit: 10,
  currentPageNumber: 1,
  //   search: null,
};

const ACTION_TYPE = {
  PAGE_ROW: "page_row",
  PAGINATION: "pagination",
  STATUS: "status",
  //   SEARCH: "search",
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPE.STATUS:
      return { ...state, status: action.payload || null, currentPageNumber: 1 };
    // case ACTION_TYPE.SEARCH:
    //   return {
    //     ...state,
    //     search: action.payload || null,
    //     currentPageNumber: 1,
    //   };
    case ACTION_TYPE.PAGE_ROW:
      return {
        ...state,
        pageRow: action.payload || null,
        ...(action.payload && {
          pageLimit: action.payload,
        }),
        currentPageNumber: 1,
      };
    case ACTION_TYPE.PAGINATION:
      return {
        ...state,
        currentPageNumber: action.payload || null,
      };

    default:
      return;
  }
};

const useFilter = () => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const data = React.useMemo(() => {
    return {
      ...state,
    };
  }, [state]);

  return {
    state,
    data,
    dispatch,
    ACTION_TYPE,
  };
};

export default useFilter;
