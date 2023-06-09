import {Box, Container} from "@mui/material";

const TermsShort = ({ terms }: any) => {
  return (
    <Box>
      <Container>
        <Box dangerouslySetInnerHTML={{ __html: terms }} />
      </Container>
    </Box>
  )
}

export const getStaticProps = async () => {
  try {
    const terms = await import('fs')
      .then(fs => fs.readFileSync('public/terms_long.txt', 'utf8'))
      //.then((txt: string) => txt.replaceAll(/\n/g, '<br/>'))
    return {props: {terms}}
  } catch (e) {
    return { props: {} }
  }
};

export default TermsShort
