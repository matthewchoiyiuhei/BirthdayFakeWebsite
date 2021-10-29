import { React, Component, components, core } from 'avg-core';
import Namebox from './components/Namebox';
import Selection from './components/Selection';
import Textbutton from './components/Textbutton';
import Loading from './components/Loading';

const { Layer, Textwindow, BGImage, FGImage, Tween } = components;

export default class CustomScene extends Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }
  static childContextTypes = {
    location: React.PropTypes.object
  }
  constructor(props) {
    super(props);

    this.onScriptLoading = this.onScriptLoading.bind(this);
    this.onScriptLoaded = this.onScriptLoaded.bind(this);
    this.onScriptLoadingProgress = this.onScriptLoadingProgress.bind(this);
    this.routerCommand = this.routerCommand.bind(this);

    this.state = {
      loading: false,
      progress: 0,
      shaking: false
    };

    this.buttonBarVisible = false;
  }
  getChildContext() {
    return {
      location: this.props.location
    };
  }
  loop(){
    console.log(this.state.shaking)
    if(this.state.shaking){
      core.stage.transform.position.x = -50+Math.random()*100
      core.stage.transform.position.y = -50+Math.random()*100
    }else{
      core.stage.transform.position.x = 0
      core.stage.transform.position.y = 0
    }
  }
  async componentDidMount() {
    await core.use('script-loading', this.onScriptLoading);
    await core.use('script-loaded', this.onScriptLoaded);
    await core.use('script-loading-progress', this.onScriptLoadingProgress);

    await core.use('script-exec', this.routerCommand);

    await core.post('flow-init');
    await core.post('screenshot-init');

    if (this.props.location.state) {
      await core.post('load-archive', { name: this.props.location.state });
    } else {
      const chapter = this.props.params.chapter;

      await core.post('script-load', { name: `scripts/${chapter}`, autoStart: true });
    }

    window.addEventListener('keyup', (e) => {
      if (e.keyCode === 32 || e.keyCode === 13) {
        this.handleClick(e);
      } else if (e.keyCode === 75) {
        core.post('script-mode', {});
      }
    });
    window.addEventListener('keydown', (e) => {
      if (e.keyCode === 75 && e.ctrlKey) {
        core.post('script-mode', { mode: 'skip' });
      }
    });
    this.interval = setInterval(() => {
      this.loop();
    }
    , 1);
  }
  componentDidUpdate(prevProps) {
    const chapter = this.props.params.chapter;
    const prevChapter = prevProps.params.chapter;

    if (chapter !== prevChapter) {
      core.post('script-load', { name: `scripts/${chapter}`, autoStart: true });
    }
  }
  componentWillUnmount() {
    core.unuse('script-loading', this.onScriptLoading);
    core.unuse('script-loaded', this.onScriptLoaded);
    core.unuse('script-loading-progress', this.onScriptLoadingProgress);

    core.unuse('script-exec', this.routerCommand);
  }
  async onScriptLoading(ctx, next) {
    this.setState({ loading: true });
    await next();
  }
  async onScriptLoaded(ctx, next) {
    this.setState({ loading: false });
    await next();
  }
  async onScriptLoadingProgress(ctx, next) {
    this.setState({
      progress: Math.round(ctx.progress * 10) / 10,
    });
    await next();
  }
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async routerCommand(ctx, next) {
    const { command, flags, params } = ctx;
    if (command === 'router') {
      if (flags.includes('push')) {
        this.context.router.push(params.path);
      } else if (flags.includes('goBack')) {
        this.context.router.goBack();
      }
    }
    else if (command === 'opentab') {
      if (flags.includes('rickroll')) {
        window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', "_blank");
      }else if(flags.includes("tongshen")){
        window.open('https://www.youtube.com/watch?v=072tU1tamd0', "_blank")
      }
    }else if(command==="shake"){
      console.log(core);
      if(flags.includes("on")){
        this.setState({shaking: true})
      }else if (flags.includes("off")){
        this.setState({shaking: false})
      }
    }else if(command==="wait"){
      var ms = params.ms;
      await this.sleep(ms);
    }
    await next();
  }
  handleClick(e) {
    core.post('script-trigger');
    e.stopPropagation();
  }
  goto(e, path) {
    const currentPath = this.props.location.pathname;

    this.context.router.push(`${currentPath}/${path}`);
    e.stopPropagation();
  }
  skip(e) {
    core.post('script-mode', { mode: 'skip' });
    e.stopPropagation();
  }
  auto(e) {
    core.post('script-mode', { mode: 'auto' });
    e.stopPropagation();
  }
  render() {
    return (
      <Tween ref={tween => (this.tween = tween)} buttonMode={false}
        onClick={this.handleClick.bind(this)} onTap={this.handleClick.bind(this)}>
        <Layer>
          <BGImage />
          <FGImage width={1920} height={1500}/>
          <Selection />
          <Textwindow
            bgFile='textwindow/bg.png'
            size={40} color={0xffffff} bold={false} speed={80}
            x={50} y={650} textRect={[300, 150, 600, 150]} yInterval={6}
            style={{"fontFamily": ['demon', 'PingFang SC']}}
          >
            <Namebox x={300} y={82} />
            {/*
            <Textbutton text='Save' style={{ fontSize: 16, lineHeight: 16 }} position={[490, 200]} anchor={[0.5, 1]} onPointerTap={e => this.goto(e, 'save')}/>
            <Textbutton text='Load' style={{ fontSize: 16, lineHeight: 16 }} position={[540, 200]} anchor={[0.5, 1]} onPointerTap={e => this.goto(e, 'load')}/>
            <Textbutton text='Auto' style={{ fontSize: 16, lineHeight: 16 }} position={[590, 200]} anchor={[0.5, 1]} onPointerTap={this.auto.bind(this)}/>
            <Textbutton text='Skip' style={{ fontSize: 16, lineHeight: 16 }} position={[640, 200]} anchor={[0.5, 1]} onPointerTap={this.skip.bind(this)}/>
            <Textbutton text='History' style={{ fontSize: 16, lineHeight: 16 }} position={[700, 200]} anchor={[0.5, 1]} onPointerTap={e => this.goto(e, 'history')}/>
            <Textbutton text='Option' style={{ fontSize: 16, lineHeight: 16 }} position={[765, 200]} anchor={[0.5, 1]} onPointerTap={e => this.goto(e, 'option')}/>
            */}
          </Textwindow>
        </Layer>
        {this.props.children}
        {this.state.loading ? <Loading progress={this.state.progress} /> : null}
      </Tween>
    );
  }
}
