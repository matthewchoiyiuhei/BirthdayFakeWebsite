import { React, Component, components, ui, core } from 'avg-core';

const { Image, Text } = components;
const { Checkbox, Button } = ui;

export default class Title extends Component {
  constructor(props){
    super(props);
    this.state = {
      alphaIncrease: 0.005,
      alpha: 0
    }
    this.loop();
  }
  loop(){
    this.state.alpha+=this.state.alphaIncrease;
    console.log("hi")
    setTimeout(this.loop, 1);
  }
  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({ alpha: this.state.alpha+this.state.alphaIncrease });
      if(this.state.alpha > 1 || this.state.alpha < 0){
        this.setState({alphaIncrease: -this.state.alphaIncrease});
      }
      console.log("hi")
    }
    , 1);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  static contextTypes = {
    router: React.PropTypes.any
  }
  static propTypes = {
    children: React.PropTypes.any
  }
  requestFullscreen() {
    core.plugins.fullscreen.request();
  }
  jumpTo(path) {
    this.context.router.push(path);
  }
  render() {
    return (
      <Image src='common/bg.png' onClick={() => {
        this.requestFullscreen();
        this.jumpTo('/story')
      }} onTap={() => {
        this.requestFullscreen();
        this.jumpTo('/story')
      }}>
      <Text text="點擊任意地方開始" x={800} y={800} alpha={this.state.alpha} style={{
        "fontWeight": "bold",
        "align": "center",
        "fontSize":"40px"
        }}/>
      </Image>
    );
  }
}
