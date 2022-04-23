import React, {Component } from 'react';

export class CheckOption extends Component {
    constructor(props) {
        super(props);
    }

    render() {
      const { htmlFor, checked, id, handler } = this.props;

      <div className="check-option-wrap">
          <label htmlFor={htmlFor}>
              <input
                  name="uploadOption[]"
                  checked={checked}
                  type="checkbox" id={id}
                  onChange={handler}
              />
          </label> .{htmlFor}
      </div>
    }
}