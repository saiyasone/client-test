import { useLazyQuery } from "@apollo/client";
import { Breadcrumbs, Stack, Typography } from "@mui/material";
import { styled as muiStyled } from "@mui/system";
import { QUERY_FOLDER } from "api/graphql/folder.graphql";
import _ from "lodash";
import { useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import NormalButton from "./NormalButton";

const BreadcrumbNavigateContainer = muiStyled("div")({
  display: "flex",
  alignItems: "center",
  p: {
    height: "auto",
  },
});

// const iconFolderStyled = <FiFolder fill="white" />;

const BreadcrumbNavigate = (props) => {
  const navigate = useNavigate();
  const [breadcrumbData, setBreadcrumbData] = useState<any>(null);
  const readablePath = [
    ...(props.title ? [props.title] : []),
    ...(props.readablePath ? props.readablePath : []),
  ];

  // const [getFolder, lazyQueryFolder] = useLazyQuery(QUERY_FOLDER);
  const [getFolder] = useLazyQuery(QUERY_FOLDER);

  useEffect(() => {
    const breadcrumbNewData: any[] = [];
    const fullPath: any[] = [];
    if (props.path) {
      [...(props.title ? [props.title] : []), ...(props.path || [])].forEach(
        (item, index) => {
          let genNewItem = item;
          if (index > 0) {
            fullPath.push(item);
          }
          if (props.disableDefault) {
            breadcrumbNewData.push({
              name: readablePath?.[index] || genNewItem,
              path: item,
            });
          } else {
            if (item || props.readablePath?.[index]) {
              genNewItem =
                _.capitalize(item || props.readablePath?.[index]) || item;
              breadcrumbNewData.push({
                name: props.readablePath?.[index] || genNewItem,
                path: props.disableDefault
                  ? item
                  : fullPath.slice(0, index + 1).join("/"),
              });
            }
          }
        },
      );
    }
    setBreadcrumbData(breadcrumbNewData);
  }, [props.path]);

  const handleNavigate = async (data) => {
    if (!props.disableDefault) {
      const result = await getFolder({
        variables: {
          where: {
            path: data.path,
            createdBy: props.user?._id,
          },
        },
      });
      if (result) {
        const [dataById] = result.data.folders.data;
        props.handleNavigate(dataById?.path);
      }
    } else {
      props.handleNavigate(data);
    }
  };

  return (
    <BreadcrumbNavigateContainer>
      <Stack spacing={2}>
        <Breadcrumbs
          separator={props.separatorIcon || <FaAngleRight />}
          aria-label="breadcrumb"
        >
          {breadcrumbData &&
            breadcrumbData.map((data, index) => {
              return (
                <div
                  key={index + 1}
                  style={{
                    columnGap: "3px",
                    alignItems: "center",
                    display: "flex",
                    width: "calc(100% + 5px)",
                  }}
                >
                  <Typography
                    component="div"
                    sx={{
                      fontSize: "1rem",
                      ...(index !== breadcrumbData.length - 1
                        ? {
                            fontWeight: 400,
                            color: "rgba(0, 0, 0, 0.7)",
                          }
                        : {
                            color: "rgba(0, 0, 0, 1)",
                          }),
                    }}
                  >
                    {(index === 0 && !props.disableTitleNavigate) ||
                    (index > 0 && index !== breadcrumbData.length - 1) ? (
                      <NormalButton
                        variant="outlined"
                        sx={{
                          color: "rgba(0, 0, 0, 0.7)",
                          fontFamily:
                            "Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol",
                          fontSize: "1rem",
                          lineHeight: 1.25,
                          height: "100%",
                          width: "100%",
                          transition: "200ms",
                          "&:hover": {
                            color: "rgba(0, 0, 0, 1)",
                          },
                        }}
                        onClick={() => {
                          if (index === 0 || props.disableDefault) {
                            navigate(props.titlePath || data || "/my-cloud");
                          } else {
                            handleNavigate(data);
                          }
                        }}
                      >
                        {data.name}
                      </NormalButton>
                    ) : (
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "inherit",
                          ...(index === breadcrumbData.length - 1 && {
                            fontWeight: 600,
                          }),
                        }}
                      >
                        {data.name}
                      </Typography>
                    )}
                  </Typography>
                </div>
              );
            })}
        </Breadcrumbs>
      </Stack>
    </BreadcrumbNavigateContainer>
  );
};

export default BreadcrumbNavigate;
