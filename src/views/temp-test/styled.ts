import styled from 'styled-components';

export const Wrap = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  //background-image: radial-gradient(circle at 100% 50%, rgba(6, 43, 71, 0.85), rgba(5, 24, 41, 0.85) 66%);
  //background-image: radial-gradient(circle at 100% 50%,rgb(19 67 104 / 85%),rgb(44 70 94 / 85%) 66%);
  overflow: auto;
  //display: flex;
  //justify-content: space-between;
  //align-items: center;
  //flex-wrap: wrap;
  display: flex;
  justify-content: center;
  align-items: center;
  .testAxisChart {
    width: 60vw;
    height: 45vh;
    background-color: aliceblue;
  }
`;