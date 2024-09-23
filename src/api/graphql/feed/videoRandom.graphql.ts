import { gql } from "@apollo/client";

export const QUERY_RANDOM_VDO = gql`
  query RandomVideos(
    $limit: Int!
    $option: OptionType!
    $searchKeyword: String
  ) {
    randomVideos(
      limit: $limit
      option: $option
      searchKeyword: $searchKeyword
    ) {
      data {
        visibility {
          comment
        }
        option {
          video {
            id
            source {
              preview_url
            }
          }
          title
          tag
        }
        action {
          total_comment
          total_dislike
          total_download
          total_like
          total_share
          total_view
        }
        platform
        id
        chanelId
        createdAt
        chanel {
          id
          prefix
          userId
          name
          createdAt
          updatedAt
          option {
            total_post
            total_view_fromPost
            total_like_fromPost
            total_dislike_fromPost
            total_download_fromPost
            total_share_fromPost
            total_follower
            total_following
          }
        }
      }
      error {
        code
        details
        message
      }
      success
    }
  }
`;
