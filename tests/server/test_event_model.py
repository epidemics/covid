from server.event_model import stress, excess, stress_dict, ei_dict

def test_stress_excess():
	pop = 33e8
	numbers = [0,1,9,20,90,104,944,3467,6763,12345,89435,102937,876543,3212334,9481367,43213211,62457565]
	fracs = [num/pop for num in numbers]
	strengths = [0.101*i for i in range(11)] + [0.09*i for i in range(11)] #0,0.101,...,1.01
	l, m = [], []
	for frac,strength in [(a,b) for a in fracs for b in strengths]:
		l.append(excess(frac, strength))
		m.append(stress(frac, strength))
	assert min(l) == min(ei_dict.values())
	assert max(l) == max(ei_dict.values())
	assert min(m) == min(stress_dict.values())
	assert max(m) == max(stress_dict.values())