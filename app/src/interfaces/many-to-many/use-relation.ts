import { Ref, computed } from '@vue/composition-api';
import { useCollectionsStore, useRelationsStore } from '@/stores/';
import useCollection from '@/composables/use-collection';
import { Relation } from '@/types';

export type RelationInfo = {
	junctionPkField: string;
	relationPkField: string;
	junctionRelation: string;
	junctionCollection: string;
	relationCollection: string;
};

export default function useRelation(collection: Ref<string>, field: Ref<string>) {
	const relationsStore = useRelationsStore();
	const collectionsStore = useCollectionsStore();

	const relations = computed(() => {
		return relationsStore.getRelationsForField(collection.value, field.value) as Relation[];
	});

	const junction = computed(() => {
		return relations.value.find((relation) => relation.one_collection === collection.value) as Relation;
	});

	const relation = computed(() => {
		return relations.value.find((relation) => relation.one_collection !== collection.value) as Relation;
	});

	const junctionCollection = computed(() => {
		return collectionsStore.getCollection(junction.value.many_collection)!;
	});

	const relationCollection = computed(() => {
		return collectionsStore.getCollection(relation.value.one_collection)!;
	});

	const { primaryKeyField: junctionPrimaryKeyField } = useCollection(junctionCollection.value.collection);
	const { primaryKeyField: relationPrimaryKeyField } = useCollection(relationCollection.value.collection);

	const relationFields = computed(() => {
		return {
			junctionPkField: junctionPrimaryKeyField.value.field,
			relationPkField: relationPrimaryKeyField.value.field,
			junctionRelation: junction.value.junction_field as string,
			junctionCollection: junctionCollection.value.collection,
			relationCollection: relationCollection.value.collection,
		} as RelationInfo;
	});

	return {
		junction,
		junctionCollection,
		relation,
		relationCollection,
		relationFields,
		junctionPrimaryKeyField,
		relationPrimaryKeyField,
	};
}
