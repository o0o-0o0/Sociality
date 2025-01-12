import { Button, Container, Menu } from 'semantic-ui-react'
import { NavLink } from 'react-router-dom';

export default function NavBar() {
 
  return (
    <Menu inverted fixed='top'>
    <Container>
        <Menu.Item as={NavLink} to='/' header>
            <img src="/assets/logo.png" alt="logo" style={{marginRight:'10px'}}/>
            Reactivities
        </Menu.Item>
        <Menu.Item as={NavLink} to='/activities' name="Activites" />
        <Menu.Item>
            <Button as={NavLink} to='/addActivity' positive content='Add Activity' />
        </Menu.Item>
    </Container>
</Menu>
  )
}
