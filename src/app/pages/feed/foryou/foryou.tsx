import { Box, Card, CardMedia, Paper } from "@mui/material";
import Layout from "../layout";
import VideoContainer from "components/feed/video/videoContainer";
import { useGetRandomVdo } from "hooks/feed/useRandomVdo";
import useFeedVdoFilter from "hooks/feed/useFeedVdoFilter";

export default function ForYou() {
  const { state, dispatch, ACTION_TYPE } = useFeedVdoFilter();
  const { data, isSuccess, loading } = useGetRandomVdo(state);

  return (
    <>
      <Layout>
        <VideoContainer data={data?.data} />
      </Layout>
    </>
  );
}
