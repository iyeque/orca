dao_state = {
    'proposals': [],
    'votes': {},
}

def create_proposal(title, description):
    proposal_id = len(dao_state['proposals']) + 1
    dao_state['proposals'].append({'id': proposal_id, 'title': title, 'description': description, 'votes': 0})
    dao_state['votes'][proposal_id] = 0
    return proposal_id

def vote(proposal_id):
    if proposal_id in dao_state['votes']:
        dao_state['votes'][proposal_id] += 1
        for p in dao_state['proposals']:
            if p['id'] == proposal_id:
                p['votes'] = dao_state['votes'][proposal_id]
        return True
    return False

def get_proposals():
    return dao_state['proposals'] 