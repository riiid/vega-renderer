import axios from 'axios';
import Rx from 'rx';

/*
 * {
 *   "postProcess": {
 *     "type": "lambda" | "slack-webhook",
 *     "resource": <URL> | <LAMBDA_FUNCTION_NAME> | <LAMBDA_FUNCTION_ARN>,
 *     "data": {
 *       "username": "<USER_NAME>",
 *       "icon_emoji": ":robot_face:",
 *       "text": "",
 *       "channel": "<CHANNEL>",
 *       "attachments" [{
 *         "author_name": "<AUTHOR_NAME>"
 *       }]
 *     }
 *   }
 * }
 */
export const post$ = (event, result) => {
  const {postProcess = {}} = event;

  switch (postProcess.type) {
    case 'lambda':
      break;
    case 'slack-webhook': {
      const data = {...postProcess.data};
      data.attachments = [
        {image_url: result, title_link: result}, ...(data.attachments || [])
      ];
      const body = JSON.stringify(data);
      return axios.post(postProcess.resource, body)
        .then(() => Object.assign({result}, {post: postProcess.type}));
    }
    default:
      return Rx.Observable.return({result});
  }
};
