import nock from 'nock';
import {post$} from 'post';

describe('post.js', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('post$ with slack-webhook', () => {
    nock('http://localhost:11111')
      .post('/', () => true)
      .reply(200, {status: 'ok'});

    return post$({
      postProcess: {
        type: 'slack-webhook',
        resource: 'http://localhost:11111',
        data: {
          username: '<USER_NAME>',
          attachments: []
        }
      }
    }, '<IMAGE_URL>')
    .then(result => {
      expect(result).toEqual({
        result: '<IMAGE_URL>',
        post: 'slack-webhook'
      });
    });
  });
});
