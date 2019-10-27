import { API } from 'projectData-client';
import faker from 'faker';

export const api = new API('http://invalid./');

export const create_example_data = async function() {
  // api.setparams...

  // create example data
  //const title = e.target['todo'].value;
  //const date = new Date();
  const db = await api.getSource('entries');
  await db.delete({"topics": { $size: 3 }});

  const topics  = Array(10).fill(0).map(e => faker.commerce.productName());
  const tags = Array(30).fill(0).map(e => faker.commerce.productAdjective());
  const randomTopic = () => topics[Math.floor(Math.random()*topics.length)];
  const randomTag = () => tags[Math.floor(Math.random()*tags.length)];

  return (async () => {
    for (let x = 0; x < 10; x++) {
      await db.add({topics: Array(3).fill(0).map(e=>({
        topic: randomTopic(),
        tags: Array(6).fill(0).map(e=>randomTag()),
      }))});
    }
    console.log('done');
  })();
}
