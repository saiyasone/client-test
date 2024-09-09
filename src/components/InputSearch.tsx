import { InputBase, styled } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Search as SearchIcon } from "react-feather";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";

const Search = styled("div")(({ theme }: any) => ({
  borderRadius: "2px",
  backgroundColor: theme.header.background,
  display: "flex",
  alignItems: "center",
  position: "relative",
  width: "100%",
  border: "1px solid #ececec",
  padding:"0.3rem",
}));

const SearchIconWrapper = styled("div")(() => ({
  width: "40px",
  height: "100%",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  svg: {
    width: "22px",
    height: "22px",
  },
}));

const Input = styled(InputBase)(({ theme }: any) => ({
  color: "inherit",
  width: "100%",
  borderRadius: "2px",

  input: {
    color: theme.header.search.color,
    paddingTop: theme.spacing(1.5),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1.5),
    height: "100%",
    width: "100%",
  },
}));

function InputSearch(props:any) {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();

  const inputRef = useRef<any>(null);

  const { inputSearch, setInputHover, onChange, onEnter } = props.data;

  const [value, setValue] = useState(inputSearch);

  const handleOnChange = (e:any) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleOnEnterKey = (e:any) => {
    if (e?.keyCode === 13 && inputSearch) {
      onEnter();
      inputRef.current.blur();
      setInputHover(false);
    }
  };

  useEffect(() => {
    if (/\/search\/.*/i.test(location.pathname)) {
      if (params?.name) {
        setValue(params?.name);
        onChange(params?.name);
      }
    }
  }, [params]);

  const onMouseOver = () => {
    setInputHover(true);
  };

  return (
    <div>
      <Search>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <Input
          inputRef={inputRef}
          placeholder={t("Search")}
          type="text"
          value={value || ""}
          onFocus={(e) => {
            setInputHover(true);
            handleOnChange(e);
          }}
          onChange={(e) => {
            if (e.target.value) {
              setInputHover(true);
            }
            handleOnChange(e);
          }}
          onKeyUp={(e) => handleOnEnterKey(e)}
          onMouseDown={onMouseOver}
          onTouchStart={onMouseOver} 
          {...props.inputProps}
        />
      </Search>
    </div>
  );
}

export default InputSearch;
