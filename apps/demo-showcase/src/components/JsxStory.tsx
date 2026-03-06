import { defineComponent } from 'vue';

export const JsxStory = defineComponent({
  name: 'JsxStory',
  props: {
    items: {
      type: Array as () => Array<{ id: number; title: string; owner: string; status: string }>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <view class="jsx-card">
        <text class="jsx-title">JSX Workstream</text>
        {props.items.map((item) => (
          <view class="jsx-row" key={item.id}>
            <text>{item.title}</text>
            <text>{item.owner} · {item.status}</text>
          </view>
        ))}
      </view>
    );
  },
});

export default JsxStory;
