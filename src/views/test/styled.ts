// import styled, { createGlobalStyle } from 'styled-components';
import styled from 'styled-components';
// import bg from './img/bg-img.png';
import saveAsImage from './img/save-as-image.png';

export const Wrap = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle at 100% 50%, rgba(6, 43, 71, 0.85), rgba(5, 24, 41, 0.85) 66%);
  overflow: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;

  .chartsWrap {
    width: 30vw;
    height: 40vh;
    //width: 45vw;
    //height: 60vh;
  }

  .header {
    .rightComponent {
      .btnWrap {
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
    }
  }
`;

export const SaveAsImage = styled.div`
  position: relative;
  width: 16px;
  height: 16px;
  background-image: url(${saveAsImage});
  background-size: 100% 100%;
  cursor: pointer;
`;
