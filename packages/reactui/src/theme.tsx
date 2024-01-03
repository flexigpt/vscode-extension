import { grommet } from 'grommet';
import { deepMerge } from 'grommet/utils';

const rosePineBaseTheme = {
  defaultMode: 'dark',
  global: {
    colors: {
      brand: {
        dark: '#eb6f92',
        light: '#eb6f92'
      },
      background: {
        dark: '#191724',
        light: '#1f1d2e'
      },
      'background-back': {
        dark: '#191724',
        light: '#1f1d2e'
      },
      'background-front': {
        dark: '#26233a',
        light: '#26233a'
      },
      'background-contrast': {
        dark: '#FFFFFF11',
        light: '#11111111'
      },
      text: {
        dark: '#e0def4',
        light: '#575279'
      },
      'text-strong': {
        dark: '#FFFFFF',
        light: '#000000'
      },
      'text-weak': {
        dark: '#6e6a86',
        light: '#6e6a86'
      },
      'text-xweak': {
        dark: '#908caa',
        light: '#908caa'
      },
      border: {
        dark: '#444444',
        light: '#CCCCCC'
      },
      control: 'brand',
      'active-background': 'background-contrast',
      'active-text': 'text-strong',
      'selected-background': 'brand',
      'selected-text': 'text-strong',
      'status-critical': '#FF4040',
      'status-warning': '#FFAA15',
      'status-ok': '#00C781',
      'status-unknown': '#CCCCCC',
      'status-disabled': '#CCCCCC',
      'graph-0': 'brand',
      'graph-1': 'status-warning'
    },
    active: {
      background: 'active-background',
      color: 'active-text'
    },
    hover: {
      background: 'active-background',
      color: 'active-text'
    },
    selected: {
      background: 'selected-background',
      color: 'selected-text'
    }
  },
  tip: {
    content: {
      background: {
        color: 'background'
      }
    }
  },
  layer: {
    background: {
      dark: '#111111',
      light: '#FFFFFF'
    }
  },
  font: {
    family: 'Roboto',
    size: '18px',
    height: '20px'
  }
};

const rosePineMoonTheme = {
  defaultMode: 'dark',
  global: {
    colors: {
      brand: {
        dark: '#eb6f92',
        light: '#eb6f92'
      },
      background: {
        dark: '#232136',
        light: '#2a273f'
      },
      'background-back': {
        dark: '#232136',
        light: '#2a273f'
      },
      'background-front': {
        dark: '#393552',
        light: '#393552'
      },
      'background-contrast': {
        dark: '#FFFFFF11',
        light: '#11111111'
      },
      text: {
        dark: '#e0def4',
        light: '#575279'
      },
      'text-strong': {
        dark: '#FFFFFF',
        light: '#000000'
      },
      'text-weak': {
        dark: '#6e6a86',
        light: '#6e6a86'
      },
      'text-xweak': {
        dark: '#908caa',
        light: '#908caa'
      },
      border: {
        dark: '#444444',
        light: '#CCCCCC'
      },
      control: 'brand',
      'active-background': 'background-contrast',
      'active-text': 'text-strong',
      'selected-background': 'brand',
      'selected-text': 'text-strong',
      'status-critical': '#FF4040',
      'status-warning': '#FFAA15',
      'status-ok': '#00C781',
      'status-unknown': '#CCCCCC',
      'status-disabled': '#CCCCCC',
      'graph-0': 'brand',
      'graph-1': 'status-warning'
    },
    active: {
      background: 'active-background',
      color: 'active-text'
    },
    hover: {
      background: 'active-background',
      color: 'active-text'
    },
    selected: {
      background: 'selected-background',
      color: 'selected-text'
    }
  },
  tip: {
    content: {
      background: {
        color: 'background'
      }
    }
  },
  layer: {
    background: {
      dark: '#111111',
      light: '#FFFFFF'
    }
  },
  font: {
    family: 'Roboto',
    size: '18px',
    height: '20px'
  }
};

const rosePineDawnTheme = {
  defaultMode: 'light',
  global: {
    colors: {
      brand: {
        dark: '#b4637a',
        light: '#b4637a'
      },
      background: {
        dark: '#faf4ed',
        light: '#fffaf3'
      },
      'background-back': {
        dark: '#faf4ed',
        light: '#fffaf3'
      },
      'background-front': {
        dark: '#f2e9e1',
        light: '#f2e9e1'
      },
      'background-contrast': {
        dark: '#FFFFFF11',
        light: '#11111111'
      },
      text: {
        dark: '#575279',
        light: '#e0def4'
      },
      'text-strong': {
        dark: '#575279',
        light: '#575279'
      },
      'text-weak': {
        dark: '#9893a5',
        light: '#797593'
      },
      'text-xweak': {
        dark: '#797593',
        light: '#797593'
      },
      border: {
        dark: '#cecacd',
        light: '#cecacd'
      },
      control: 'brand',
      'active-background': 'background-contrast',
      'active-text': 'text-strong',
      'selected-background': 'brand',
      'selected-text': 'text-strong',
      'status-critical': '#FF4040',
      'status-warning': '#FFAA15',
      'status-ok': '#00C781',
      'status-unknown': '#CCCCCC',
      'status-disabled': '#CCCCCC',
      'graph-0': 'brand',
      'graph-1': 'status-warning'
    },
    active: {
      background: 'active-background',
      color: 'active-text'
    },
    hover: {
      background: 'active-background',
      color: 'active-text'
    },
    selected: {
      background: 'selected-background',
      color: 'selected-text'
    }
  },
  tip: {
    content: {
      background: {
        color: 'background'
      }
    }
  },
  layer: {
    background: {
      dark: '#111111',
      light: '#FFFFFF'
    }
  },
  font: {
    family: 'Roboto',
    size: '18px',
    height: '20px'
  }
};

const mergedRosePineTheme = {
  defaultMode: 'dark', // Default mode set to 'dark', change as needed
  global: {
    colors: {
      brand: {
        dark: '#393552',
        light: '#f2e9e1'
      },
      background: {
        dark: '#232136', // from rosePineMoonTheme
        light: '#fffaf3' // from rosePineDawnTheme
      },
      'background-back': {
        dark: '#232136', // from rosePineMoonTheme
        light: '#fffaf3' // from rosePineDawnTheme
      },
      'background-front': {
        dark: '#393552', // from rosePineMoonTheme
        light: '#f2e9e1' // from rosePineDawnTheme
      },
      'background-contrast': {
        dark: '#FFFFFF11', // from rosePineMoonTheme
        light: '#11111111' // from rosePineDawnTheme
      },
      text: {
        dark: '#e0def4', // from rosePineMoonTheme
        light: '#575279' // from rosePineDawnTheme
      },
      'text-strong': {
        dark: '#FFFFFF', // from rosePineMoonTheme
        light: '#575279' // from rosePineDawnTheme
      },
      'text-weak': {
        dark: '#6e6a86', // from rosePineMoonTheme
        light: '#797593' // from rosePineDawnTheme
      },
      'text-xweak': {
        dark: '#908caa', // from rosePineMoonTheme
        light: '#797593' // from rosePineDawnTheme
      },
      border: {
        dark: '#444444', // from rosePineMoonTheme
        light: '#cecacd' // from rosePineDawnTheme
      },
      // icon: 'text-xweak',
      control: 'brand',
      'active-background': 'background-contrast',
      'active-text': 'text-strong',
      'selected-background': 'brand',
      'selected-text': 'text-strong',
      'status-critical': '#FF4040',
      'status-warning': '#FFAA15',
      'status-ok': '#00C781',
      'status-unknown': '#CCCCCC',
      'status-disabled': '#CCCCCC',
      'graph-0': 'brand',
      'graph-1': 'status-warning'
    },
    active: {
      background: 'active-background',
      color: 'active-text'
    },
    hover: {
      background: 'active-background',
      color: 'active-text'
    },
    selected: {
      background: 'selected-background',
      color: 'selected-text'
    }
  },
  font: {
    family: 'Roboto', // Shared value, change as needed
    size: '18px', // Shared value, change as needed
    height: '20px' // Shared value, change as needed
  }
};

export const RosePineBaseTheme = deepMerge(grommet, rosePineBaseTheme);
export const RosePineDawnTheme = deepMerge(grommet, rosePineDawnTheme);
export const RosePineMoonTheme = deepMerge(grommet, rosePineMoonTheme);
export const RosePineMergedTheme = deepMerge(grommet, mergedRosePineTheme);
